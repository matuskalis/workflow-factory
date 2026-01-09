import type { PermissionDef } from '@workflow-factory/blocks';

interface PermissionsListProps {
  permissions: PermissionDef[];
}

export function PermissionsList({ permissions }: PermissionsListProps) {
  if (permissions.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400">
        Uses default permissions only.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {permissions.map((perm) => (
        <div
          key={perm.scope}
          className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded"
        >
          <div className="flex items-center gap-2">
            <code className="text-sm">{perm.scope}:</code>
            <span
              className={`text-sm font-medium ${
                perm.level === 'write'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {perm.level}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-500">
            {perm.reason}
          </span>
        </div>
      ))}
    </div>
  );
}
