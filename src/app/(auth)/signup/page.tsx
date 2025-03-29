'use client';

import { NextPage } from 'next';
import Layout from '../../../components/layout';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { stackClient } from '../../../lib/stack-client';

const Signup: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'magiclink' | 'otp'>('password');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      await stackClient.signUpWithCredential({
        email,
        password
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create account');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
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
      // Implement OTP functionality if supported by stackClient
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
      // Implement OTP verification if supported by stackClient
      // For now, redirect to dashboard as if successful
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
            Create your account
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

            {/* Password Signup Form */}
            {authMethod === 'password' && (
              <form className="space-y-6" onSubmit={handlePasswordSignup}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

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
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? 'Creating account...' : 'Sign up'}
                  </button>
                </div>
              </form>
            )}

            {/* Magic Link Signup Form */}
            {authMethod === 'magiclink' && (
              <form className="space-y-6" onSubmit={handleMagicLinkSignup}>
                <div>
                  <label htmlFor="name-magic" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name-magic"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

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
                  <>
                    <div className="mt-4">
                      <label htmlFor="magic-otp" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter verification code from email
                      </label>
                      <div className="flex justify-between gap-2">
                        {[...Array(6)].map((_, i) => (
                          <input
                            key={i}
                            type="text"
                            maxLength={1}
                            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            onChange={(e) => {
                              // Move to next input field if this one is filled
                              if (e.target.value && e.target.nextElementSibling instanceof HTMLInputElement) {
                                e.target.nextElementSibling.focus();
                              }
                              
                              // Update OTP state
                              const otpArray = otp.split('');
                              otpArray[i] = e.target.value;
                              setOtp(otpArray.join(''));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        onClick={handleOtpVerify}
                        disabled={otp.length !== 6 || isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center">
                      We&apos;ve sent a verification code to your email.
                    </p>
                  </>
                )}
              </form>
            )}

            {/* OTP Signup Form */}
            {authMethod === 'otp' && (
              <>
                {!otpSent ? (
                  <form className="space-y-6" onSubmit={handleOtpRequest}>
                    <div>
                      <label htmlFor="name-otp" className="block text-sm font-medium text-gray-700">
                        Full name
                      </label>
                      <div className="mt-1">
                        <input
                          id="name-otp"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

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
                        {isLoading ? 'Verifying...' : 'Verify & Create Account'}
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
                    Already have an account?
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup; 