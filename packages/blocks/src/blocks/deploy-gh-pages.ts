import type {
  Block,
  BlockConfig,
  Constraint,
  PermissionDef,
  SecretDef,
  YamlFragment,
  WorkflowStep,
} from '../types.js';

export const deployGhPages: Block = {
  id: 'deploy-gh-pages',
  name: 'Deploy to GitHub Pages',
  description: 'Deploy static files to GitHub Pages',

  emit(config?: BlockConfig): YamlFragment {
    const steps: WorkflowStep[] = [
      {
        name: 'Setup Pages',
        uses: 'actions/configure-pages@v4',
      },
      {
        name: 'Upload artifact',
        uses: 'actions/upload-pages-artifact@v3',
        with: {
          path: config?.workingDirectory ?? './dist',
        },
      },
      {
        name: 'Deploy to GitHub Pages',
        id: 'deployment',
        uses: 'actions/deploy-pages@v4',
      },
    ];

    return { steps };
  },

  secrets(): SecretDef[] {
    return [];
  },

  permissions(): PermissionDef[] {
    return [
      {
        scope: 'contents',
        level: 'read',
        reason: 'Required to checkout repository',
      },
      {
        scope: 'pages',
        level: 'write',
        reason: 'Required to deploy to GitHub Pages',
      },
      {
        scope: 'id-token',
        level: 'write',
        reason: 'Required for GitHub Pages deployment verification',
      },
    ];
  },

  constraints(): Constraint[] {
    return [];
  },
};
