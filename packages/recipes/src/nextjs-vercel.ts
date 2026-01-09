import type { Recipe } from '@workflow-factory/blocks';

export const nextjsVercel: Recipe = {
  id: 'nextjs-vercel',
  slug: 'nextjs-vercel',
  name: 'Next.js to Vercel',
  description:
    'Deploy Next.js applications to Vercel with PR previews and production deployments',
  stack: ['nextjs', 'vercel', 'node'],

  triggers: {
    push: {
      branches: ['main'],
    },
    pull_request: {
      branches: ['main'],
    },
  },

  concurrency: {
    group: '${{ github.workflow }}-${{ github.ref }}',
    'cancel-in-progress': true,
  },

  jobs: [
    {
      id: 'deploy-preview',
      name: 'Deploy Preview',
      runsOn: 'ubuntu-latest',
      if: "github.event_name == 'pull_request'",
      blocks: [
        { blockId: 'checkout' },
        {
          blockId: 'setup-node',
          config: { nodeVersion: '20', packageManager: 'npm' },
        },
        { blockId: 'install-deps', config: { packageManager: 'npm' } },
        {
          blockId: 'deploy-vercel',
          config: { environment: 'preview' },
        },
      ],
    },
    {
      id: 'deploy-production',
      name: 'Deploy Production',
      runsOn: 'ubuntu-latest',
      if: "github.event_name == 'push' && github.ref == 'refs/heads/main'",
      environment: 'production',
      blocks: [
        { blockId: 'checkout' },
        {
          blockId: 'setup-node',
          config: { nodeVersion: '20', packageManager: 'npm' },
        },
        { blockId: 'install-deps', config: { packageManager: 'npm' } },
        {
          blockId: 'deploy-vercel',
          config: { environment: 'production' },
        },
      ],
    },
  ],

  metadata: {
    seoTitle: 'Deploy Next.js to Vercel with GitHub Actions',
    seoDescription:
      'Complete GitHub Actions workflow for deploying Next.js applications to Vercel with automatic PR previews and production deployments.',
    commonFailures: [
      {
        title: 'VERCEL_TOKEN not set',
        description:
          'The workflow fails with authentication error during deployment.',
        solution:
          'Create a Vercel token at vercel.com/account/tokens and add it as a repository secret named VERCEL_TOKEN.',
      },
      {
        title: 'Missing VERCEL_ORG_ID or VERCEL_PROJECT_ID',
        description:
          'Deployment fails with "Project not found" or similar error.',
        solution:
          'Run `vercel link` locally to generate .vercel/project.json, then add the orgId and projectId as secrets.',
      },
      {
        title: 'Build fails with missing dependencies',
        description: 'Next.js build fails due to missing packages.',
        solution:
          'Ensure package-lock.json is committed and all dependencies are listed correctly in package.json.',
      },
    ],
    relatedRecipes: ['nextjs-cloudflare', 'react-vite-netlify'],
  },
};
