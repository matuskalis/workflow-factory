import type { SecretDef } from '@workflow-factory/blocks';

interface SecretsListProps {
  secrets: SecretDef[];
}

export function SecretsList({ secrets }: SecretsListProps) {
  if (secrets.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400">
        No additional secrets required.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {secrets.map((secret) => (
        <div
          key={secret.name}
          className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {secret.name}
            </code>
            {secret.required && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Required
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {secret.description}
          </p>
          {secret.example && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {secret.example}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
