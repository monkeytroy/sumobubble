'use client';

import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Older browsers / no permission — silently no-op.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label || 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy'}
      className="inline-flex items-center gap-1 text-gray-500 hover:text-indigo-600 p-1 bg-transparent border-0 cursor-pointer align-middle">
      {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ClipboardIcon className="w-4 h-4" />}
    </button>
  );
}
