import type {
  Block,
  BlockConfig,
  Constraint,
  PermissionDef,
  SecretDef,
  YamlFragment,
  WorkflowStep,
} from '../types.js';

export const dockerBuildx: Block = {
  id: 'docker-buildx',
  name: 'Docker Buildx',
  description: 'Build and push Docker image using buildx with GHCR login',

  emit(config?: BlockConfig): YamlFragment {
    const registry = config?.registry ?? 'ghcr.io';
    const imageName = config?.imageName ?? '${{ github.repository }}';
    const dockerfile = config?.dockerfile ?? 'Dockerfile';
    const context = config?.context ?? '.';
    const platforms = config?.platforms ?? ['linux/amd64'];
    const pushEnabled = config?.pushEnabled ?? true;

    const steps: WorkflowStep[] = [
      {
        name: 'Set up QEMU',
        uses: 'docker/setup-qemu-action@v3',
      },
      {
        name: 'Set up Docker Buildx',
        uses: 'docker/setup-buildx-action@v3',
      },
      {
        name: 'Log in to Container Registry',
        uses: 'docker/login-action@v3',
        with: {
          registry,
          username: '${{ github.actor }}',
          password: '${{ secrets.GITHUB_TOKEN }}',
        },
      },
      {
        name: 'Extract metadata (tags, labels)',
        id: 'meta',
        uses: 'docker/metadata-action@v5',
        with: {
          images: `${registry}/${imageName}`,
          tags: [
            'type=ref,event=branch',
            'type=ref,event=pr',
            'type=semver,pattern={{version}}',
            'type=semver,pattern={{major}}.{{minor}}',
            'type=sha',
          ].join('\n'),
        },
      },
      {
        name: 'Build and push Docker image',
        uses: 'docker/build-push-action@v5',
        with: {
          context,
          file: dockerfile,
          platforms: platforms.join(','),
          push: pushEnabled,
          tags: '${{ steps.meta.outputs.tags }}',
          labels: '${{ steps.meta.outputs.labels }}',
          cache_from: 'type=gha',
          cache_to: 'type=gha,mode=max',
        },
      },
    ];

    return { steps };
  },

  secrets(): SecretDef[] {
    return [
      {
        name: 'GITHUB_TOKEN',
        description: 'GitHub token for GHCR authentication (automatically provided)',
        required: true,
        example: 'Automatically provided by GitHub Actions',
      },
    ];
  },

  permissions(): PermissionDef[] {
    return [
      {
        scope: 'contents',
        level: 'read',
        reason: 'Required to checkout repository',
      },
      {
        scope: 'packages',
        level: 'write',
        reason: 'Required to push images to GHCR',
      },
    ];
  },

  constraints(): Constraint[] {
    return [
      {
        type: 'requires-docker',
      },
    ];
  },
};
