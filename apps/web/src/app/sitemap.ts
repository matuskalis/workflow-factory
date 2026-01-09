import type { MetadataRoute } from 'next';
import { recipes } from '@workflow-factory/recipes';

const BASE_URL = process.env.SITE_URL || 'https://workflow-factory.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const recipeUrls = recipes.map((recipe) => ({
    url: `${BASE_URL}/recipes/${recipe.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...recipeUrls,
  ];
}
