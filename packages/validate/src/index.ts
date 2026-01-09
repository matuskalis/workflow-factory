import yaml from 'js-yaml';
import type { GeneratorOutput, SecretDef } from '@workflow-factory/blocks';

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ParsedWorkflow {
  name?: string;
  on?: Record<string, unknown>;
  permissions?: Record<string, string>;
  concurrency?: Record<string, unknown>;
  jobs?: Record<string, ParsedJob>;
}

interface ParsedJob {
  name?: string;
  'runs-on'?: string;
  steps?: ParsedStep[];
  needs?: string | string[];
  if?: string;
  environment?: string;
  permissions?: Record<string, string>;
}

interface ParsedStep {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
  id?: string;
  if?: string;
}

/**
 * Extract all secret references from YAML content
 */
function extractSecretReferences(yamlContent: string): string[] {
  const secretPattern = /\$\{\{\s*secrets\.([A-Z_][A-Z0-9_]*)\s*\}\}/g;
  const secrets: string[] = [];
  let match;

  while ((match = secretPattern.exec(yamlContent)) !== null) {
    const secretName = match[1];
    if (secretName && !secrets.includes(secretName)) {
      secrets.push(secretName);
    }
  }

  return secrets;
}

/**
 * Validate YAML structure
 */
function validateStructure(
  workflow: ParsedWorkflow,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Check required top-level keys
  if (!workflow.name) {
    errors.push({
      code: 'MISSING_NAME',
      message: 'Workflow must have a name',
      path: 'name',
    });
  }

  if (!workflow.on) {
    errors.push({
      code: 'MISSING_TRIGGER',
      message: 'Workflow must have at least one trigger (on)',
      path: 'on',
    });
  }

  if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
    errors.push({
      code: 'MISSING_JOBS',
      message: 'Workflow must have at least one job',
      path: 'jobs',
    });
    return;
  }

  // Validate each job
  for (const [jobId, job] of Object.entries(workflow.jobs)) {
    if (!job['runs-on']) {
      errors.push({
        code: 'MISSING_RUNS_ON',
        message: `Job "${jobId}" must specify runs-on`,
        path: `jobs.${jobId}.runs-on`,
      });
    }

    if (!job.steps || job.steps.length === 0) {
      errors.push({
        code: 'MISSING_STEPS',
        message: `Job "${jobId}" must have at least one step`,
        path: `jobs.${jobId}.steps`,
      });
      continue;
    }

    // Validate each step
    for (let i = 0; i < job.steps.length; i++) {
      const step = job.steps[i];
      if (!step) continue;

      if (!step.uses && !step.run) {
        errors.push({
          code: 'INVALID_STEP',
          message: `Step ${i + 1} in job "${jobId}" must have either 'uses' or 'run'`,
          path: `jobs.${jobId}.steps[${i}]`,
        });
      }

      // Warn about unpinned actions
      if (step.uses) {
        const actionPattern = /^[^@]+@(.+)$/;
        const match = actionPattern.exec(step.uses);
        if (!match) {
          warnings.push({
            code: 'UNPINNED_ACTION',
            message: `Action "${step.uses}" should be pinned to a version`,
            path: `jobs.${jobId}.steps[${i}].uses`,
          });
        } else {
          const version = match[1];
          // Warn if using latest or master
          if (version === 'latest' || version === 'master' || version === 'main') {
            warnings.push({
              code: 'UNSTABLE_VERSION',
              message: `Action "${step.uses}" uses unstable version "${version}"`,
              path: `jobs.${jobId}.steps[${i}].uses`,
            });
          }
        }
      }
    }
  }
}

/**
 * Validate that all referenced secrets are declared
 */
function validateSecrets(
  yamlContent: string,
  declaredSecrets: SecretDef[],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const referencedSecrets = extractSecretReferences(yamlContent);
  const declaredNames = new Set(declaredSecrets.map((s) => s.name));

  // GITHUB_TOKEN is always available
  declaredNames.add('GITHUB_TOKEN');

  for (const secretName of referencedSecrets) {
    if (!declaredNames.has(secretName)) {
      errors.push({
        code: 'UNDECLARED_SECRET',
        message: `Secret "${secretName}" is referenced but not declared in recipe metadata`,
      });
    }
  }

  // Check for unused declared secrets
  for (const secret of declaredSecrets) {
    if (
      secret.name !== 'GITHUB_TOKEN' &&
      !referencedSecrets.includes(secret.name)
    ) {
      warnings.push({
        code: 'UNUSED_SECRET',
        message: `Secret "${secret.name}" is declared but not referenced in the workflow`,
      });
    }
  }
}

/**
 * Validate permissions
 */
function validatePermissions(
  workflow: ParsedWorkflow,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  const validScopes = new Set([
    'actions',
    'checks',
    'contents',
    'deployments',
    'id-token',
    'issues',
    'packages',
    'pages',
    'pull-requests',
    'security-events',
    'statuses',
  ]);

  const validLevels = new Set(['read', 'write', 'none']);

  if (workflow.permissions) {
    for (const [scope, level] of Object.entries(workflow.permissions)) {
      if (!validScopes.has(scope)) {
        errors.push({
          code: 'INVALID_PERMISSION_SCOPE',
          message: `Invalid permission scope: "${scope}"`,
          path: `permissions.${scope}`,
        });
      }
      if (!validLevels.has(level)) {
        errors.push({
          code: 'INVALID_PERMISSION_LEVEL',
          message: `Invalid permission level: "${level}" for scope "${scope}"`,
          path: `permissions.${scope}`,
        });
      }
    }
  }

  // Check job-level permissions too
  if (workflow.jobs) {
    for (const [jobId, job] of Object.entries(workflow.jobs)) {
      if (job.permissions) {
        for (const [scope, level] of Object.entries(job.permissions)) {
          if (!validScopes.has(scope)) {
            errors.push({
              code: 'INVALID_PERMISSION_SCOPE',
              message: `Invalid permission scope in job "${jobId}": "${scope}"`,
              path: `jobs.${jobId}.permissions.${scope}`,
            });
          }
          if (!validLevels.has(level)) {
            errors.push({
              code: 'INVALID_PERMISSION_LEVEL',
              message: `Invalid permission level in job "${jobId}": "${level}"`,
              path: `jobs.${jobId}.permissions.${scope}`,
            });
          }
        }
      }
    }
  }
}

/**
 * Validate triggers
 */
function validateTriggers(
  workflow: ParsedWorkflow,
  _errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!workflow.on) return;

  const validEvents = new Set([
    'push',
    'pull_request',
    'pull_request_target',
    'workflow_dispatch',
    'workflow_call',
    'schedule',
    'release',
    'create',
    'delete',
    'deployment',
    'issues',
    'issue_comment',
    'label',
    'milestone',
    'page_build',
    'project',
    'public',
    'registry_package',
    'repository_dispatch',
    'status',
    'watch',
    'fork',
  ]);

  // Handle shorthand syntax like `on: push` or `on: [push, pull_request]`
  if (typeof workflow.on === 'string' || Array.isArray(workflow.on)) {
    const events = Array.isArray(workflow.on) ? workflow.on : [workflow.on];
    for (const event of events) {
      if (!validEvents.has(event)) {
        warnings.push({
          code: 'UNKNOWN_EVENT',
          message: `Unknown trigger event: "${event}"`,
          path: 'on',
        });
      }
    }
    return;
  }

  for (const event of Object.keys(workflow.on)) {
    if (!validEvents.has(event)) {
      warnings.push({
        code: 'UNKNOWN_EVENT',
        message: `Unknown trigger event: "${event}"`,
        path: `on.${event}`,
      });
    }
  }

  // Check for potentially dangerous triggers
  if (
    typeof workflow.on === 'object' &&
    workflow.on !== null &&
    'pull_request_target' in workflow.on
  ) {
    warnings.push({
      code: 'DANGEROUS_TRIGGER',
      message:
        'pull_request_target can be dangerous - ensure you understand the security implications',
      path: 'on.pull_request_target',
    });
  }
}

/**
 * Validate a generated workflow
 */
export function validateWorkflow(output: GeneratorOutput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Parse YAML
  let workflow: ParsedWorkflow;
  try {
    workflow = yaml.load(output.yaml) as ParsedWorkflow;
  } catch (e) {
    return {
      valid: false,
      errors: [
        {
          code: 'INVALID_YAML',
          message: `Failed to parse YAML: ${e instanceof Error ? e.message : 'Unknown error'}`,
        },
      ],
      warnings: [],
    };
  }

  // Run validations
  validateStructure(workflow, errors, warnings);
  validateSecrets(output.yaml, output.secrets, errors, warnings);
  validatePermissions(workflow, errors, warnings);
  validateTriggers(workflow, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Quick validation that just checks if YAML is valid
 */
export function isValidYaml(yamlContent: string): boolean {
  try {
    yaml.load(yamlContent);
    return true;
  } catch {
    return false;
  }
}

export type { GeneratorOutput } from '@workflow-factory/blocks';
