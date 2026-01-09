import { describe, expect, test } from 'vitest';
import { validateWorkflow, isValidYaml } from '@workflow-factory/validate';
import type { GeneratorOutput, Recipe } from '@workflow-factory/blocks';

const createMockOutput = (yaml: string, secrets: { name: string }[] = []): GeneratorOutput => ({
  yaml,
  secrets: secrets.map((s) => ({
    name: s.name,
    description: '',
    required: true,
  })),
  permissions: [],
  notes: [],
  recipe: {} as Recipe,
});

describe('isValidYaml', () => {
  test('returns true for valid YAML', () => {
    expect(isValidYaml('name: test\non: push\njobs: {}')).toBe(true);
  });

  test('returns false for invalid YAML', () => {
    expect(isValidYaml('{ invalid yaml: [')).toBe(false);
  });
});

describe('validateWorkflow', () => {
  test('validates minimal valid workflow', () => {
    const yaml = `
name: Test
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('errors on missing name', () => {
    const yaml = `
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_NAME')).toBe(true);
  });

  test('errors on missing trigger', () => {
    const yaml = `
name: Test
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_TRIGGER')).toBe(true);
  });

  test('errors on missing jobs', () => {
    const yaml = `
name: Test
on: push
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_JOBS')).toBe(true);
  });

  test('errors on missing runs-on', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'MISSING_RUNS_ON')).toBe(true);
  });

  test('errors on step without uses or run', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Empty step
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_STEP')).toBe(true);
  });

  test('warns on unpinned actions', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.warnings.some((w) => w.code === 'UNPINNED_ACTION')).toBe(true);
  });

  test('warns on unstable versions', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@main
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.warnings.some((w) => w.code === 'UNSTABLE_VERSION')).toBe(true);
  });
});

describe('Secret Validation', () => {
  test('errors on undeclared secrets', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo \${{ secrets.MY_SECRET }}
`;
    const result = validateWorkflow(createMockOutput(yaml, []));
    expect(result.errors.some((e) => e.code === 'UNDECLARED_SECRET')).toBe(true);
  });

  test('allows declared secrets', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo \${{ secrets.MY_SECRET }}
`;
    const result = validateWorkflow(
      createMockOutput(yaml, [{ name: 'MY_SECRET' }])
    );
    expect(result.errors.some((e) => e.code === 'UNDECLARED_SECRET')).toBe(false);
  });

  test('GITHUB_TOKEN is always allowed', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo \${{ secrets.GITHUB_TOKEN }}
`;
    const result = validateWorkflow(createMockOutput(yaml, []));
    expect(result.errors.some((e) => e.code === 'UNDECLARED_SECRET')).toBe(false);
  });

  test('warns on unused declared secrets', () => {
    const yaml = `
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo hello
`;
    const result = validateWorkflow(
      createMockOutput(yaml, [{ name: 'UNUSED_SECRET' }])
    );
    expect(result.warnings.some((w) => w.code === 'UNUSED_SECRET')).toBe(true);
  });
});

describe('Permission Validation', () => {
  test('validates valid permissions', () => {
    const yaml = `
name: Test
on: push
permissions:
  contents: read
  packages: write
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.errors.filter((e) => e.code.startsWith('INVALID_PERMISSION'))).toHaveLength(0);
  });

  test('errors on invalid permission scope', () => {
    const yaml = `
name: Test
on: push
permissions:
  invalid-scope: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.errors.some((e) => e.code === 'INVALID_PERMISSION_SCOPE')).toBe(true);
  });

  test('errors on invalid permission level', () => {
    const yaml = `
name: Test
on: push
permissions:
  contents: admin
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.errors.some((e) => e.code === 'INVALID_PERMISSION_LEVEL')).toBe(true);
  });
});

describe('Trigger Validation', () => {
  test('warns on pull_request_target', () => {
    const yaml = `
name: Test
on:
  pull_request_target:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo test
`;
    const result = validateWorkflow(createMockOutput(yaml));
    expect(result.warnings.some((w) => w.code === 'DANGEROUS_TRIGGER')).toBe(true);
  });
});
