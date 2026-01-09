'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

interface YamlBlockProps {
  yaml: string;
  recipeName?: string;
}

export function YamlBlock({ yaml, recipeName }: YamlBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    trackEvent('copy_yaml', { recipe: recipeName || 'unknown' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy.yml';
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('download_yaml', { recipe: recipeName || 'unknown' });
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          Download
        </button>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="pt-12">
        <code>{yaml}</code>
      </pre>
    </div>
  );
}
