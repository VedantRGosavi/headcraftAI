// components/Layout.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiCamera, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import { User } from '../types/user';
import { signOut } from '../lib/auth';
import { toast } from 'react-hot-toast';

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
  user?: User | null;
  loading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  title = 'headcraftAI',
  children,
  user,
  loading = false,
}) => {
  const router = useRouter();

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Generate professional headshots with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-xl font-bold text-blue-600 flex items-center">
                    <FiCamera className="mr-2" />
                    headcraftAI
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              {loading ? (
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <span className={`px-3 py-2 rounded-md text-sm font-medium ${
                      router.pathname === '/dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <FiGrid className="inline-block mr-1" />
                      Dashboard
                    </span>
                  </Link>
                  
                  <Link href="/profile">
                    <span className={`px-3 py-2 rounded-md text-sm font-medium ${
                      router.pathname === '/profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <FiUser className="inline-block mr-1" />
                      Profile
                    </span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="inline-block mr-1" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <span className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900">
                      Log In
                    </span>
                  </Link>
                  <Link href="/signup">
                    <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      Sign Up
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} headcraftAI. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;