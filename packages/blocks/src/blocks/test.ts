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

export const test: Block = {
  id: 'test',
  name: 'Test',
  description: 'Run the test command',

  emit(config?: BlockConfig): YamlFragment {
    const packageManager = config?.packageManager ?? 'npm';
    const testCommand = config?.testCommand ?? 'test';
    const workingDirectory = config?.workingDirectory;

    const command = testCommand.includes(' ')
      ? testCommand
      : `${getRunPrefix(packageManager)} ${testCommand}`;

    return {
      steps: [
        {
          name: 'Test',
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
