import type {
  Block,
  BlockConfig,
  Constraint,
  PackageManager,
  PermissionDef,
  SecretDef,
  YamlFragment,
} from '../types.js';

function getRunPrefix(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm';
    case 'yarn':
      return 'yarn';
    case 'npm':
    default:
      return 'npm run';
  }
}

export const lint: Block = {
  id: 'lint',
  name: 'Lint',
  description: 'Run the lint command',

  emit(config?: BlockConfig): YamlFragment {
    const packageManager = config?.packageManager ?? 'npm';
    const lintCommand = config?.lintCommand ?? 'lint';
    const workingDirectory = config?.workingDirectory;

    const command = lintCommand.includes(' ')
      ? lintCommand
      : `${getRunPrefix(packageManager)} ${lintCommand}`;

    return {
      steps: [
        {
          name: 'Lint',
          run: command,
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
