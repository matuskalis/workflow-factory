/**
 * Core type definitions for workflow blocks
 */

// Package manager types
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

// Node version type
export type NodeVersion = '18' | '20' | '22';

// Permission scopes
export type PermissionScope =
  | 'actions'
  | 'checks'
  | 'contents'
  | 'deployments'
  | 'id-token'
  | 'issues'
  | 'packages'
  | 'pages'
  | 'pull-requests'
  | 'security-events'
  | 'statuses';

export type PermissionLevel = 'read' | 'write' | 'none';

export interface PermissionDef {
  scope: PermissionScope;
  level: PermissionLevel;
  reason: string;
}

// Secret definitions
export interface SecretDef {
  name: string;
  description: string;
  required: boolean;
  example?: string;
}

// Constraint types
export type ConstraintType =
  | 'requires-docker'
  | 'requires-tag-trigger'
  | 'requires-subdirectory'
  | 'requires-secrets';

export interface Constraint {
  type: ConstraintType;
  value?: string;
}

// YAML fragment types
export interface WorkflowStep {
  name?: string;
  id?: string;
  uses?: string;
  run?: string;
  with?: Record<string, string | number | boolean>;
  env?: Record<string, string>;
  if?: string;
  'working-directory'?: string;
}

export interface YamlFragment {
  steps: WorkflowStep[];
  env?: Record<string, string>;
}

// Block interface - the core contract
export interface Block {
  id: string;
  name: string;
  description: string;
  emit(config?: BlockConfig): YamlFragment;
  secrets(): SecretDef[];
  permissions(): PermissionDef[];
  constraints(): Constraint[];
}

// Block configuration options
export interface BlockConfig {
  // Common options
  workingDirectory?: string;
  condition?: string;

  // Node-specific
  nodeVersion?: NodeVersion;
  packageManager?: PackageManager;
  cacheEnabled?: boolean;

  // Docker-specific
  registry?: string;
  imageName?: string;
  dockerfile?: string;
  context?: string;
  platforms?: string[];
  pushEnabled?: boolean;

  // Deploy-specific
  environment?: 'preview' | 'production';
  projectId?: string;

  // Build-specific
  buildCommand?: string;
  testCommand?: string;
  lintCommand?: string;
}

// Trigger configuration
export interface TriggerConfig {
  push?: {
    branches?: string[];
    tags?: string[];
    paths?: string[];
    'paths-ignore'?: string[];
  };
  pull_request?: {
    branches?: string[];
    types?: string[];
    paths?: string[];
    'paths-ignore'?: string[];
  };
  workflow_dispatch?: {
    inputs?: Record<
      string,
      {
        description: string;
        required?: boolean;
        default?: string;
        type?: 'string' | 'boolean' | 'choice';
        options?: string[];
      }
    >;
  };
  release?: {
    types?: string[];
  };
}

// Job configuration
export interface JobConfig {
  id: string;
  name: string;
  runsOn: string;
  needs?: string[];
  if?: string;
  environment?: string;
  blocks: Array<{
    blockId: string;
    config?: BlockConfig;
  }>;
}

// Recipe metadata
export interface RecipeMetadata {
  seoTitle: string;
  seoDescription: string;
  commonFailures: Array<{
    title: string;
    description: string;
    solution: string;
  }>;
  relatedRecipes?: string[];
}

// Full recipe definition
export interface Recipe {
  id: string;
  slug: string;
  name: string;
  description: string;
  stack: string[];
  triggers: TriggerConfig;
  concurrency?: {
    group: string;
    'cancel-in-progress'?: boolean;
  };
  jobs: JobConfig[];
  metadata: RecipeMetadata;
}

// Generator output
export interface GeneratorOutput {
  yaml: string;
  secrets: SecretDef[];
  permissions: PermissionDef[];
  notes: string[];
  recipe: Recipe;
}
