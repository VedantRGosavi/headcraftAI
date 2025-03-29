import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
} 