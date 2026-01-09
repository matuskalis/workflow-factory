import yaml from 'js-yaml';
import {
  type GeneratorOutput,
  type JobConfig,
  type PermissionDef,
  type PermissionLevel,
  type PermissionScope,
  type Recipe,
  type SecretDef,
  type TriggerConfig,
  type WorkflowStep,
  getBlock,
} from '@workflow-factory/blocks';

interface WorkflowJob {
  name: string;
  'runs-on': string;
  needs?: string[];
  if?: string;
  environment?: string;
  permissions?: Record<string, PermissionLevel>;
  steps: WorkflowStep[];
  env?: Record<string, string>;
}

interface Workflow {
  name: string;
  on: TriggerConfig;
  permissions?: Record<string, PermissionLevel>;
  concurrency?: {
    group: string;
    'cancel-in-progress'?: boolean;
  };
  jobs: Record<string, WorkflowJob>;
}

/**
 * Merge permissions from multiple blocks, keeping the highest level for each scope
 */
function mergePermissions(permissionsList: PermissionDef[][]): PermissionDef[] {
  const merged = new Map<PermissionScope, PermissionDef>();

  const levelOrder: Record<PermissionLevel, number> = {
    none: 0,
    read: 1,
    write: 2,
  };

  for (const permissions of permissionsList) {
    for (const perm of permissions) {
      const existing = merged.get(perm.scope);
      if (!existing || levelOrder[perm.level] > levelOrder[existing.level]) {
        merged.set(perm.scope, perm);
      }
    }
  }

  return Array.from(merged.values());
}

/**
 * Merge secrets from multiple blocks, removing duplicates
 */
function mergeSecrets(secretsList: SecretDef[][]): SecretDef[] {
  const merged = new Map<string, SecretDef>();

  for (const secrets of secretsList) {
    for (const secret of secrets) {
      if (!merged.has(secret.name)) {
        merged.set(secret.name, secret);
      }
    }
  }

  return Array.from(merged.values());
}

/**
 * Convert permissions to workflow YAML format
 */
function permissionsToYaml(
  permissions: PermissionDef[]
): Record<string, PermissionLevel> {
  const result: Record<string, PermissionLevel> = {};
  for (const perm of permissions) {
    result[perm.scope] = perm.level;
  }
  return result;
}

/**
 * Compile a job configuration into a workflow job
 */
function compileJob(
  jobConfig: JobConfig
): {
  job: WorkflowJob;
  secrets: SecretDef[];
  permissions: PermissionDef[];
  notes: string[];
} {
  const steps: WorkflowStep[] = [];
  const allSecrets: SecretDef[][] = [];
  const allPermissions: PermissionDef[][] = [];
  const notes: string[] = [];
  let jobEnv: Record<string, string> = {};

  for (const blockRef of jobConfig.blocks) {
    const block = getBlock(blockRef.blockId);
    if (!block) {
      throw new Error(`Unknown block: ${blockRef.blockId}`);
    }

    const fragment = block.emit(blockRef.config);
    steps.push(...fragment.steps);

    if (fragment.env) {
      jobEnv = { ...jobEnv, ...fragment.env };
    }

    allSecrets.push(block.secrets());
    allPermissions.push(block.permissions());

    // Collect constraint-based notes
    for (const constraint of block.constraints()) {
      if (constraint.type === 'requires-secrets') {
        notes.push(`Requires secrets: ${constraint.value}`);
      }
      if (constraint.type === 'requires-docker') {
        notes.push('This workflow requires Docker to be available');
      }
    }
  }

  const job: WorkflowJob = {
    name: jobConfig.name,
    'runs-on': jobConfig.runsOn,
    steps,
  };

  if (jobConfig.needs && jobConfig.needs.length > 0) {
    job.needs = jobConfig.needs;
  }

  if (jobConfig.if) {
    job.if = jobConfig.if;
  }

  if (jobConfig.environment) {
    job.environment = jobConfig.environment;
  }

  if (Object.keys(jobEnv).length > 0) {
    job.env = jobEnv;
  }

  return {
    job,
    secrets: mergeSecrets(allSecrets),
    permissions: mergePermissions(allPermissions),
    notes: [...new Set(notes)],
  };
}

/**
 * Generate a complete workflow from a recipe
 */
export function generateWorkflow(recipe: Recipe): GeneratorOutput {
  const jobs: Record<string, WorkflowJob> = {};
  const allSecrets: SecretDef[][] = [];
  const allPermissions: PermissionDef[][] = [];
  const allNotes: string[] = [];

  for (const jobConfig of recipe.jobs) {
    const result = compileJob(jobConfig);
    jobs[jobConfig.id] = result.job;
    allSecrets.push(result.secrets);
    allPermissions.push(result.permissions);
    allNotes.push(...result.notes);
  }

  const mergedSecrets = mergeSecrets(allSecrets);
  const mergedPermissions = mergePermissions(allPermissions);

  const workflow: Workflow = {
    name: recipe.name,
    on: recipe.triggers,
    jobs,
  };

  // Add workflow-level permissions
  if (mergedPermissions.length > 0) {
    workflow.permissions = permissionsToYaml(mergedPermissions);
  }

  // Add concurrency if specified
  if (recipe.concurrency) {
    workflow.concurrency = recipe.concurrency;
  }

  // Generate YAML
  const yamlOutput = yaml.dump(workflow, {
    lineWidth: -1, // No line wrapping
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });

  return {
    yaml: yamlOutput,
    secrets: mergedSecrets,
    permissions: mergedPermissions,
    notes: [...new Set(allNotes)],
    recipe,
  };
}

// Re-export types that consumers might need
export type { GeneratorOutput, Recipe } from '@workflow-factory/blocks';
