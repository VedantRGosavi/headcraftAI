// src/app/(auth)/login/signup.tsx
import type { NextPage } from 'next';
import Link from 'next/link';
import { SignUp } from '@stackframe/stack';
import Layout from '../../../components/layout';

const Signup: NextPage = () => {
  return (
    <Layout title="Sign Up - headcraftAI">
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                log in to your existing account
              </span>
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <SignUp />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;