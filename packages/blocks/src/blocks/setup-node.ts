import type {
  Block,
  BlockConfig,
  Constraint,
  PackageManager,
  PermissionDef,
  SecretDef,
  YamlFragment,
  WorkflowStep,
} from '../types.js';

function getPnpmSetupStep(): WorkflowStep {
  return {
    name: 'Install pnpm',
    uses: 'pnpm/action-setup@v3',
    with: {
      version: 9,
    },
  };
}

function getNodeSetupStep(
  nodeVersion: string,
  packageManager: PackageManager,
  cacheEnabled: boolean
): WorkflowStep {
  const step: WorkflowStep = {
    name: 'Set up Node.js',
    uses: 'actions/setup-node@v4',
    with: {
      'node-version': nodeVersion,
    },
  };

  if (cacheEnabled) {
    step.with = {
      ...step.with,
      cache: packageManager,
    };
  }

  return step;
}

export const setupNode: Block = {
  id: 'setup-node',
  name: 'Setup Node.js',
  description: 'Set up Node.js with optional caching for npm/pnpm/yarn',

  emit(config?: BlockConfig): YamlFragment {
    const nodeVersion = config?.nodeVersion ?? '20';
    const packageManager = config?.packageManager ?? 'npm';
    const cacheEnabled = config?.cacheEnabled ?? true;

    const steps: WorkflowStep[] = [];

    // pnpm requires action-setup before setup-node for caching to work
    if (packageManager === 'pnpm') {
      steps.push(getPnpmSetupStep());
    }

    steps.push(getNodeSetupStep(nodeVersion, packageManager, cacheEnabled));

    return { steps };
  },

  secrets(): SecretDef[] {
    return [];
  },

  permissions(): PermissionDef[] {
    return [];
  },

  constraints(): Constraint[] {
    return [];
  },
};
