'use client';

import { useEffect, useState } from 'react';
import Layout from './layout';
import Link from 'next/link';

export default function HomeContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just set loading to false immediately without checking auth
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform Your Photos into Professional Headshots
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Upload your photos and let our AI transform them into stunning professional headshots.
              Perfect for your LinkedIn profile, resume, or professional website.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/(auth)/signup"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-32">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center">
              How It Works
            </h2>
            <div className="mt-20 grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Upload Your Photos</h3>
                <p className="mt-2 text-base text-gray-600">
                  Upload a few photos of yourself in different poses and lighting conditions.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">AI Processing</h3>
                <p className="mt-2 text-base text-gray-600">
                  Our AI analyzes your photos and generates professional headshots based on your preferences.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Download & Use</h3>
                <p className="mt-2 text-base text-gray-600">
                  Download your professional headshots and use them wherever you need.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
} 