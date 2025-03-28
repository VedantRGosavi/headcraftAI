// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { supabaseClient } from '../lib/supabase';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  // Perform authentication check on initial load and route changes
  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        // Handle auth state changes
        if (event === 'SIGNED_IN') {
          // If user is signed in but on auth pages, redirect to dashboard
          if (router.pathname === '/login' || router.pathname === '/signup') {
            router.push('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          // If user is signed out and on protected pages, redirect to login
          const protectedRoutes = ['/dashboard', '/profile'];
          if (protectedRoutes.includes(router.pathname)) {
            router.push('/login');
          }
        }
      }
    );

    // Check for initial session on page load
    const checkAuth = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      
      // Initialize the app after auth check
      setInitialized(true);
      
      // If on protected route and no session, redirect to login
      const protectedRoutes = ['/dashboard', '/profile'];
      if (protectedRoutes.includes(router.pathname) && (!data.session || error)) {
        router.push('/login');
      }
    };

    checkAuth();

    // Cleanup on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  // Show loading state while initializing
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;