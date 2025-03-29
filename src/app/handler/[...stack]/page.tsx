'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { stackClient } from '../../../lib/stack-client';

export default function StackHandler() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      try {
        const user = await stackClient.getUser();
        if (user) {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error handling auth:', error);
        router.push('/');
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
