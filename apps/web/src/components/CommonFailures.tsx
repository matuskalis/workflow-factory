'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface Failure {
  title: string;
  description: string;
  solution: string;
}

interface CommonFailuresProps {
  failures: Failure[];
  recipeName?: string;
}

export function CommonFailures({ failures, recipeName }: CommonFailuresProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (failures.length === 0) {
    return null;
  }

  const handleToggle = (index: number, title: string) => {
    if (openIndex !== index) {
      trackEvent('view_failures', { recipe: recipeName || 'unknown', failure: title });
    }
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {failures.map((failure, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => handleToggle(index, failure.title)}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <span className="font-medium">{failure.title}</span>
            <span className="text-gray-400">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-2">
                {failure.description}
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Solution:
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {failure.solution}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
