import type {
  Block,
  BlockConfig,
  Constraint,
  PackageManager,
  PermissionDef,
  SecretDef,
  YamlFragment,
} from '../types.js';

function getInstallCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install --frozen-lockfile';
    case 'yarn':
      return 'yarn install --frozen-lockfile';
    case 'npm':
    default:
      return 'npm ci';
  }
}

export const installDeps: Block = {
  id: 'install-deps',
  name: 'Install Dependencies',
  description: 'Install project dependencies using the detected package manager',

  emit(config?: BlockConfig): YamlFragment {
    const packageManager = config?.packageManager ?? 'npm';
    const workingDirectory = config?.workingDirectory;

    return {
      steps: [
        {
          name: 'Install dependencies',
          run: getInstallCommand(packageManager),
          ...(workingDirectory && { 'working-directory': workingDirectory }),
        },
      ],
    };
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
