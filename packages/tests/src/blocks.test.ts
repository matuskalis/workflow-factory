import { describe, expect, test } from 'vitest';
import {
  checkout,
  setupNode,
  installDeps,
  build,
  lint,
  test as testBlock,
  deployVercel,
  dockerBuildx,
  deployGhPages,
  blockRegistry,
  getBlock,
} from '@workflow-factory/blocks';

describe('Block Registry', () => {
  test('all blocks are registered', () => {
    expect(Object.keys(blockRegistry).length).toBeGreaterThan(0);
    expect(blockRegistry['checkout']).toBe(checkout);
    expect(blockRegistry['setup-node']).toBe(setupNode);
    expect(blockRegistry['install-deps']).toBe(installDeps);
    expect(blockRegistry['build']).toBe(build);
    expect(blockRegistry['lint']).toBe(lint);
    expect(blockRegistry['test']).toBe(testBlock);
    expect(blockRegistry['deploy-vercel']).toBe(deployVercel);
    expect(blockRegistry['docker-buildx']).toBe(dockerBuildx);
    expect(blockRegistry['deploy-gh-pages']).toBe(deployGhPages);
  });

  test('getBlock returns correct blocks', () => {
    expect(getBlock('checkout')).toBe(checkout);
    expect(getBlock('setup-node')).toBe(setupNode);
    expect(getBlock('nonexistent')).toBeUndefined();
  });
});

describe('Checkout Block', () => {
  test('emits checkout step', () => {
    const fragment = checkout.emit();
    expect(fragment.steps).toHaveLength(1);
    expect(fragment.steps[0]?.uses).toBe('actions/checkout@v4');
  });

  test('requires contents:read permission', () => {
    const permissions = checkout.permissions();
    expect(permissions).toHaveLength(1);
    expect(permissions[0]?.scope).toBe('contents');
    expect(permissions[0]?.level).toBe('read');
  });

  test('has no secrets', () => {
    expect(checkout.secrets()).toHaveLength(0);
  });
});

describe('Setup Node Block', () => {
  test('emits setup-node step with npm', () => {
    const fragment = setupNode.emit({ packageManager: 'npm', nodeVersion: '20' });
    expect(fragment.steps).toHaveLength(1);
    expect(fragment.steps[0]?.uses).toBe('actions/setup-node@v4');
    expect(fragment.steps[0]?.with?.['node-version']).toBe('20');
    expect(fragment.steps[0]?.with?.cache).toBe('npm');
  });

  test('emits pnpm action-setup before setup-node', () => {
    const fragment = setupNode.emit({ packageManager: 'pnpm', nodeVersion: '20' });
    expect(fragment.steps).toHaveLength(2);
    expect(fragment.steps[0]?.uses).toBe('pnpm/action-setup@v3');
    expect(fragment.steps[1]?.uses).toBe('actions/setup-node@v4');
    expect(fragment.steps[1]?.with?.cache).toBe('pnpm');
  });

  test('defaults to npm and node 20', () => {
    const fragment = setupNode.emit();
    expect(fragment.steps).toHaveLength(1);
    expect(fragment.steps[0]?.with?.['node-version']).toBe('20');
    expect(fragment.steps[0]?.with?.cache).toBe('npm');
  });
});

describe('Install Deps Block', () => {
  test('uses npm ci for npm', () => {
    const fragment = installDeps.emit({ packageManager: 'npm' });
    expect(fragment.steps[0]?.run).toBe('npm ci');
  });

  test('uses pnpm install --frozen-lockfile for pnpm', () => {
    const fragment = installDeps.emit({ packageManager: 'pnpm' });
    expect(fragment.steps[0]?.run).toBe('pnpm install --frozen-lockfile');
  });

  test('uses yarn install --frozen-lockfile for yarn', () => {
    const fragment = installDeps.emit({ packageManager: 'yarn' });
    expect(fragment.steps[0]?.run).toBe('yarn install --frozen-lockfile');
  });
});

describe('Build Block', () => {
  test('uses npm run build by default', () => {
    const fragment = build.emit();
    expect(fragment.steps[0]?.run).toBe('npm run build');
  });

  test('uses pnpm build for pnpm', () => {
    const fragment = build.emit({ packageManager: 'pnpm' });
    expect(fragment.steps[0]?.run).toBe('pnpm build');
  });

  test('supports custom build command', () => {
    const fragment = build.emit({ buildCommand: 'next build' });
    expect(fragment.steps[0]?.run).toBe('next build');
  });
});

describe('Deploy Vercel Block', () => {
  test('requires vercel secrets', () => {
    const secrets = deployVercel.secrets();
    expect(secrets).toHaveLength(3);
    expect(secrets.map((s) => s.name)).toContain('VERCEL_TOKEN');
    expect(secrets.map((s) => s.name)).toContain('VERCEL_ORG_ID');
    expect(secrets.map((s) => s.name)).toContain('VERCEL_PROJECT_ID');
  });

  test('emits preview deploy steps', () => {
    const fragment = deployVercel.emit({ environment: 'preview' });
    expect(fragment.steps.length).toBeGreaterThan(0);
    expect(fragment.env?.VERCEL_ORG_ID).toBeTruthy();
    expect(fragment.env?.VERCEL_PROJECT_ID).toBeTruthy();
  });

  test('emits production deploy steps', () => {
    const fragment = deployVercel.emit({ environment: 'production' });
    const buildStep = fragment.steps.find((s) => s.name?.includes('Build'));
    expect(buildStep?.run).toContain('--prod');
  });
});

describe('Docker Buildx Block', () => {
  test('requires packages:write permission', () => {
    const permissions = dockerBuildx.permissions();
    const packagesWrite = permissions.find(
      (p) => p.scope === 'packages' && p.level === 'write'
    );
    expect(packagesWrite).toBeTruthy();
  });

  test('emits docker setup and build steps', () => {
    const fragment = dockerBuildx.emit();
    expect(fragment.steps.length).toBeGreaterThanOrEqual(4);

    const qemuStep = fragment.steps.find((s) =>
      s.uses?.includes('setup-qemu-action')
    );
    const buildxStep = fragment.steps.find((s) =>
      s.uses?.includes('setup-buildx-action')
    );
    const loginStep = fragment.steps.find((s) =>
      s.uses?.includes('login-action')
    );
    const buildStep = fragment.steps.find((s) =>
      s.uses?.includes('build-push-action')
    );

    expect(qemuStep).toBeTruthy();
    expect(buildxStep).toBeTruthy();
    expect(loginStep).toBeTruthy();
    expect(buildStep).toBeTruthy();
  });
});

describe('Deploy GH Pages Block', () => {
  test('requires pages:write and id-token:write permissions', () => {
    const permissions = deployGhPages.permissions();
    const pagesWrite = permissions.find(
      (p) => p.scope === 'pages' && p.level === 'write'
    );
    const idTokenWrite = permissions.find(
      (p) => p.scope === 'id-token' && p.level === 'write'
    );
    expect(pagesWrite).toBeTruthy();
    expect(idTokenWrite).toBeTruthy();
  });

  test('emits pages deployment steps', () => {
    const fragment = deployGhPages.emit();
    const configureStep = fragment.steps.find((s) =>
      s.uses?.includes('configure-pages')
    );
    const uploadStep = fragment.steps.find((s) =>
      s.uses?.includes('upload-pages-artifact')
    );
    const deployStep = fragment.steps.find((s) =>
      s.uses?.includes('deploy-pages')
    );

    expect(configureStep).toBeTruthy();
    expect(uploadStep).toBeTruthy();
    expect(deployStep).toBeTruthy();
  });
});
