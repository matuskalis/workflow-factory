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

export const build: Block = {
  id: 'build',
  name: 'Build',
  description: 'Run the build command',

  emit(config?: BlockConfig): YamlFragment {
    const packageManager = config?.packageManager ?? 'npm';
    const buildCommand = config?.buildCommand ?? 'build';
    const workingDirectory = config?.workingDirectory;

    // If buildCommand contains a space, assume it's a full command
    const command = buildCommand.includes(' ')
      ? buildCommand
      : `${getRunPrefix(packageManager)} ${buildCommand}`;

    return {
      steps: [
        {
          name: 'Build',
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
