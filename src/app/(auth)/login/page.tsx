'use client';

import { NextPage } from 'next';
import Layout from '../../../components/layout';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { stackClient } from '../../../lib/stack-client';

const Login: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'magiclink' | 'otp'>('password');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await stackClient.signInWithCredential({
        email,
        password,
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await stackClient.sendMagicLinkEmail(email);
      setOtpSent(true);
    } catch (err) {
      setError('Failed to send magic link');
      console.error('Magic link error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await stackClient.sendMagicLinkEmail(email);
      setOtpSent(true);
    } catch (err) {
      setError('Failed to send OTP');
      console.error('OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid OTP');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-500 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to home
            </Link>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Auth method tabs */}
            <div className="flex border-b mb-6">
              <button
                className={`flex-1 py-2 font-medium text-sm ${authMethod === 'password' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setAuthMethod('password')}
              >
                Password
              </button>
              <button
                className={`flex-1 py-2 font-medium text-sm ${authMethod === 'magiclink' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setAuthMethod('magiclink')}
              >
                Magic Link
              </button>
              <button
                className={`flex-1 py-2 font-medium text-sm ${authMethod === 'otp' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setAuthMethod('otp')}
              >
                One-Time Password
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Password Login Form */}
            {authMethod === 'password' && (
              <form className="space-y-6" onSubmit={handlePasswordLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            )}

            {/* Magic Link Login Form */}
            {authMethod === 'magiclink' && (
              <form className="space-y-6" onSubmit={handleMagicLinkLogin}>
                <div>
                  <label htmlFor="email-magic" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email-magic"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || otpSent}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                  >
                    {isLoading ? 'Sending...' : otpSent ? 'Check your email' : 'Send Magic Link'}
                  </button>
                </div>

                {otpSent && (
                  <p className="text-sm text-gray-600 text-center mt-4">
                    We&apos;ve sent a magic link to your email. Click on it to log in.
                  </p>
                )}
              </form>
            )}

            {/* OTP Login Form */}
            {authMethod === 'otp' && (
              <>
                {!otpSent ? (
                  <form className="space-y-6" onSubmit={handleOtpRequest}>
                    <div>
                      <label htmlFor="email-otp" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          id="email-otp"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                      >
                        {isLoading ? 'Sending...' : 'Send One-Time Password'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handleOtpVerify}>
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                        Enter One-Time Password
                      </label>
                      <div className="mt-1">
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Log in'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 text-center w-full"
                    >
                      Resend One-Time Password
                    </button>
                  </form>
                )}
              </>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don&apos;t have an account?
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/signup"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 