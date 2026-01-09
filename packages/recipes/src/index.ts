import type { Recipe } from '@workflow-factory/blocks';
import { nextjsVercel } from './nextjs-vercel.js';
import { nodeDockerGhcr } from './node-docker-ghcr.js';
import { staticGhPages } from './static-gh-pages.js';

// Export individual recipes
export { nextjsVercel } from './nextjs-vercel.js';
export { nodeDockerGhcr } from './node-docker-ghcr.js';
export { staticGhPages } from './static-gh-pages.js';

// All recipes as an array
export const recipes: Recipe[] = [nextjsVercel, nodeDockerGhcr, staticGhPages];

// Recipe lookup by ID
export const recipeById: Record<string, Recipe> = {
  'nextjs-vercel': nextjsVercel,
  'node-docker-ghcr': nodeDockerGhcr,
  'static-gh-pages': staticGhPages,
};

// Recipe lookup by slug
export const recipeBySlug: Record<string, Recipe> = {
  'nextjs-vercel': nextjsVercel,
  'node-docker-ghcr': nodeDockerGhcr,
  'static-gh-pages': staticGhPages,
};

export function getRecipe(idOrSlug: string): Recipe | undefined {
  return recipeById[idOrSlug] ?? recipeBySlug[idOrSlug];
}

export function getAllRecipes(): Recipe[] {
  return recipes;
}
