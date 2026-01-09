import { recipes } from '@workflow-factory/recipes';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">GitHub Actions Recipes</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Pre-built, validated GitHub Actions workflows for common deployment
          scenarios. Copy, paste, and deploy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.slug}`}
            className="block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">{recipe.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {recipe.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {recipe.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
