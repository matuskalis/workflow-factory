import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { recipes, getRecipe } from '@workflow-factory/recipes';
import { generateWorkflow } from '@workflow-factory/generator';
import { YamlBlock } from '@/components/YamlBlock';
import { SecretsList } from '@/components/SecretsList';
import { PermissionsList } from '@/components/PermissionsList';
import { CommonFailures } from '@/components/CommonFailures';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://workflow-factory.dev';

export function generateMetadata({ params }: PageProps): Metadata {
  const recipe = getRecipe(params.slug);
  if (!recipe) {
    return { title: 'Recipe Not Found' };
  }

  const canonicalUrl = `${SITE_URL}/recipes/${recipe.slug}`;

  return {
    title: recipe.metadata.seoTitle,
    description: recipe.metadata.seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: recipe.metadata.seoTitle,
      description: recipe.metadata.seoDescription,
      url: canonicalUrl,
      type: 'article',
    },
  };
}

export default function RecipePage({ params }: PageProps) {
  const recipe = getRecipe(params.slug);
  if (!recipe) {
    notFound();
  }

  const output = generateWorkflow(recipe);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to all recipes
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {recipe.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {recipe.stack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Workflow YAML</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Save this as <code>.github/workflows/deploy.yml</code> in your
          repository.
        </p>
        <YamlBlock yaml={output.yaml} recipeName={recipe.slug} />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Required Secrets</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Add these in your repository Settings → Secrets and variables →
          Actions.
        </p>
        <SecretsList secrets={output.secrets} />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Required Permissions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          This workflow requires the following permissions (already configured
          in the YAML).
        </p>
        <PermissionsList permissions={output.permissions} />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Common Failures</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Troubleshooting guide for common issues.
        </p>
        <CommonFailures failures={recipe.metadata.commonFailures} recipeName={recipe.slug} />
      </section>

      {recipe.metadata.relatedRecipes &&
        recipe.metadata.relatedRecipes.length > 0 && (
          <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <h2 className="text-xl font-semibold mb-4">Related Recipes</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.metadata.relatedRecipes.map((slug) => {
                const related = getRecipe(slug);
                if (!related) return null;
                return (
                  <Link
                    key={slug}
                    href={`/recipes/${slug}`}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    {related.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
    </div>
  );
}
