import { describe, expect, test } from 'vitest';
import { generateWorkflow } from '@workflow-factory/generator';
import { validateWorkflow } from '@workflow-factory/validate';
import { recipes } from '@workflow-factory/recipes';

describe('Recipe Generation', () => {
  test.each(recipes)('$id generates valid YAML', (recipe) => {
    const output = generateWorkflow(recipe);

    // Verify YAML was generated
    expect(output.yaml).toBeTruthy();
    expect(typeof output.yaml).toBe('string');

    // Verify required outputs
    expect(Array.isArray(output.secrets)).toBe(true);
    expect(Array.isArray(output.permissions)).toBe(true);
    expect(Array.isArray(output.notes)).toBe(true);
    expect(output.recipe).toBe(recipe);
  });

  test.each(recipes)('$id passes validation', (recipe) => {
    const output = generateWorkflow(recipe);
    const result = validateWorkflow(output);

    // Should be valid with no errors
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);

    // Log warnings for visibility (but don't fail on them)
    if (result.warnings.length > 0) {
      console.log(`Warnings for ${recipe.id}:`, result.warnings);
    }
  });

  test.each(recipes)('$id YAML snapshot', (recipe) => {
    const output = generateWorkflow(recipe);
    expect(output.yaml).toMatchSnapshot();
  });

  test.each(recipes)('$id secrets snapshot', (recipe) => {
    const output = generateWorkflow(recipe);
    expect(output.secrets).toMatchSnapshot();
  });

  test.each(recipes)('$id permissions snapshot', (recipe) => {
    const output = generateWorkflow(recipe);
    expect(output.permissions).toMatchSnapshot();
  });
});

describe('Recipe Metadata', () => {
  test.each(recipes)('$id has required metadata', (recipe) => {
    expect(recipe.metadata.seoTitle).toBeTruthy();
    expect(recipe.metadata.seoDescription).toBeTruthy();
    expect(Array.isArray(recipe.metadata.commonFailures)).toBe(true);
    expect(recipe.metadata.commonFailures.length).toBeGreaterThan(0);

    // Each failure should have required fields
    for (const failure of recipe.metadata.commonFailures) {
      expect(failure.title).toBeTruthy();
      expect(failure.description).toBeTruthy();
      expect(failure.solution).toBeTruthy();
    }
  });

  test.each(recipes)('$id has valid structure', (recipe) => {
    expect(recipe.id).toBeTruthy();
    expect(recipe.slug).toBeTruthy();
    expect(recipe.name).toBeTruthy();
    expect(recipe.description).toBeTruthy();
    expect(Array.isArray(recipe.stack)).toBe(true);
    expect(recipe.stack.length).toBeGreaterThan(0);
    expect(recipe.triggers).toBeTruthy();
    expect(Array.isArray(recipe.jobs)).toBe(true);
    expect(recipe.jobs.length).toBeGreaterThan(0);
  });
});
