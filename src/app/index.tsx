// src/app/index.tsx
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { FiCamera, FiArrowRight, FiUpload, FiDownload } from 'react-icons/fi';
import Layout from '../components/layout';
import { supabaseClient } from '../lib/supabase';
import { User } from '../types/user';

const features = [
  {
    icon: <FiUpload className="h-6 w-6 text-blue-500" />,
    title: 'Upload Your Photos',
    description: 'Upload multiple images of yourself to get the best results.',
  },
  {
    icon: <FiCamera className="h-6 w-6 text-blue-500" />,
    title: 'AI-Powered Generation',
    description: 'Our AI analyzes your images and creates professional-quality headshots.',
  },
  {
    icon: <FiDownload className="h-6 w-6 text-blue-500" />,
    title: 'Download & Use',
    description: 'Download your headshots for use on LinkedIn, resumes, or personal branding.',
  },
];

const Home: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <Layout user={user} loading={loading} title="headcraftAI - AI-Generated Professional Headshots">
      {/* Hero section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Professional</span>
              <span className="block text-blue-600">AI-Generated Headshots</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Get studio-quality headshots in minutes without a photographer. Upload your photos, and our AI does the rest.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href={user ? '/dashboard' : '/signup'}>
                  <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    {user ? 'Go to Dashboard' : 'Get Started'}
                    <FiArrowRight className="ml-2" />
                  </span>
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/examples">
                  <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    View Examples
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example image section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/images/headshot-example.jpg"
              alt="Example headshot"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our AI-powered platform makes it easy to get professional headshots in just a few steps.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-white">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.title}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to try it out?</span>
            <span className="block">Get your headshot today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Create professional-quality headshots in minutes, not hours.
          </p>
          <Link href={user ? '/dashboard' : '/signup'}>
            <span className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 sm:w-auto">
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </span>
          </Link>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What Our Users Say
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold">User {i}</h4>
                    <p className="mt-1 text-gray-600">
                      &ldquo;I needed a professional headshot for my LinkedIn profile but didn&apos;t want to spend hundreds on a photographer. headcraftAI gave me amazing results in minutes!&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;