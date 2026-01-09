import type {
  Block,
  BlockConfig,
  Constraint,
  PermissionDef,
  SecretDef,
  YamlFragment,
} from '../types.js';

export const checkout: Block = {
  id: 'checkout',
  name: 'Checkout',
  description: 'Check out the repository code using actions/checkout',

  emit(config?: BlockConfig): YamlFragment {
    return {
      steps: [
        {
          name: 'Checkout repository',
          uses: 'actions/checkout@v4',
          ...(config?.workingDirectory && {
            with: {
              path: config.workingDirectory,
            },
          }),
        },
      ],
    };
  },

  secrets(): SecretDef[] {
    return [];
  },

  permissions(): PermissionDef[] {
    return [
      {
        scope: 'contents',
        level: 'read',
        reason: 'Required to checkout repository code',
      },
    ];
  },

  constraints(): Constraint[] {
    return [];
  },
};
