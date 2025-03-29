'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">Oops!</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Something went wrong</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        We apologize for the inconvenience. Our team has been notified and we are working to fix the issue.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 