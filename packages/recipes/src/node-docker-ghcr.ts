import type { Recipe } from '@workflow-factory/blocks';

export const nodeDockerGhcr: Recipe = {
  id: 'node-docker-ghcr',
  slug: 'node-docker-ghcr',
  name: 'Node.js Docker to GHCR',
  description:
    'Build and push Node.js Docker images to GitHub Container Registry using buildx',
  stack: ['node', 'docker', 'ghcr'],

  triggers: {
    push: {
      branches: ['main'],
      tags: ['v*.*.*'],
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
      id: 'build-and-push',
      name: 'Build and Push Docker Image',
      runsOn: 'ubuntu-latest',
      blocks: [
        { blockId: 'checkout' },
        {
          blockId: 'docker-buildx',
          config: {
            registry: 'ghcr.io',
            imageName: '${{ github.repository }}',
            platforms: ['linux/amd64', 'linux/arm64'],
            pushEnabled: true,
          },
        },
      ],
    },
  ],

  metadata: {
    seoTitle: 'Build Node.js Docker Images and Push to GHCR with GitHub Actions',
    seoDescription:
      'Complete GitHub Actions workflow for building multi-platform Node.js Docker images with buildx and pushing to GitHub Container Registry (GHCR).',
    commonFailures: [
      {
        title: 'Permission denied pushing to GHCR',
        description:
          'The workflow fails with 403 or permission denied when pushing the image.',
        solution:
          'Ensure the workflow has `packages: write` permission. Check that GITHUB_TOKEN has access to the container registry.',
      },
      {
        title: 'Build fails with Dockerfile not found',
        description: 'Docker build cannot find the Dockerfile.',
        solution:
          'Ensure Dockerfile exists in the repository root, or update the `file` parameter to point to the correct location.',
      },
      {
        title: 'Multi-platform build is slow',
        description: 'ARM64 builds take a long time due to emulation.',
        solution:
          'Consider using self-hosted ARM runners for native builds, or remove arm64 platform if not needed.',
      },
      {
        title: 'Image tag is "unknown"',
        description: 'The pushed image has an unknown or empty tag.',
        solution:
          'Ensure you are pushing on a branch or tag that matches the metadata-action patterns. Check the git ref being used.',
      },
    ],
    relatedRecipes: ['go-docker-ghcr', 'node-aws-ecs'],
  },
};
