import type { Recipe } from '@workflow-factory/blocks';

export const staticGhPages: Recipe = {
  id: 'static-gh-pages',
  slug: 'static-gh-pages',
  name: 'Static Site to GitHub Pages',
  description:
    'Deploy static HTML/CSS/JS files to GitHub Pages with automatic deployment on push',
  stack: ['static', 'github-pages'],

  triggers: {
    push: {
      branches: ['main'],
    },
    workflow_dispatch: {},
  },

  concurrency: {
    group: 'pages',
    'cancel-in-progress': false,
  },

  jobs: [
    {
      id: 'build',
      name: 'Build',
      runsOn: 'ubuntu-latest',
      blocks: [
        { blockId: 'checkout' },
        {
          blockId: 'setup-node',
          config: { nodeVersion: '20', packageManager: 'npm' },
        },
        { blockId: 'install-deps', config: { packageManager: 'npm' } },
        { blockId: 'build', config: { packageManager: 'npm' } },
      ],
    },
    {
      id: 'deploy',
      name: 'Deploy',
      runsOn: 'ubuntu-latest',
      needs: ['build'],
      environment: 'github-pages',
      blocks: [
        {
          blockId: 'deploy-gh-pages',
          config: { workingDirectory: './dist' },
        },
      ],
    },
  ],

  metadata: {
    seoTitle: 'Deploy Static Site to GitHub Pages with GitHub Actions',
    seoDescription:
      'Complete GitHub Actions workflow for deploying static HTML, CSS, and JavaScript sites to GitHub Pages with automatic deployments.',
    commonFailures: [
      {
        title: 'Pages not enabled',
        description:
          'Deployment fails because GitHub Pages is not enabled for the repository.',
        solution:
          'Go to repository Settings > Pages and enable GitHub Pages. Select "GitHub Actions" as the source.',
      },
      {
        title: 'Permission denied',
        description:
          'The workflow fails with permission errors during deployment.',
        solution:
          'Ensure the workflow has `pages: write` and `id-token: write` permissions.',
      },
      {
        title: 'Wrong output directory',
        description:
          'The deployed site shows 404 or wrong content.',
        solution:
          'Verify that your build outputs to the directory specified in the upload-pages-artifact step (default: ./dist).',
      },
      {
        title: 'Build artifacts not found',
        description:
          'Deploy job fails because it cannot find build artifacts.',
        solution:
          'Ensure the build job completes successfully and the artifact path is correct.',
      },
    ],
    relatedRecipes: ['react-vite-netlify', 'nextjs-vercel'],
  },
};
