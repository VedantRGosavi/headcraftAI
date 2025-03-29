// components/Layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'sonner';
import { stackClient } from '../lib/stack-client';
import Header from './shared/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup');

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await stackClient.getUser();
        if (!currentUser && !isAuthPage) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (!isAuthPage) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router, isAuthPage]);

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
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Header />}
      <Toaster position="top-right" />
      <main className="py-4">
        {children}
      </main>
    </div>
  );
}