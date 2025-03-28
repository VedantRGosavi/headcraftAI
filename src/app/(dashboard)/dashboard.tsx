// src/app/(dashboard)/dashboard.tsx
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FiPlus, FiLoader, FiImage } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import Layout from '../../components/layout';
import UploadForm from '../../components/shared/UploadForm';
import ChatInterface from '../../components/shared/ChatInterface';
import HeadshotDisplay from '../../components/shared/HeadshotDisplay';
import { User } from '../../types/user';
import { HeadshotWithImages, GenerationPreference } from '../../types/image';
import { supabaseClient } from '../../lib/supabase';
import { getUserHeadshots, getHeadshotWithImages } from '../../lib/images';
import { createHeadshot } from '../../lib/images';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [headshots, setHeadshots] = useState<HeadshotWithImages[]>([]);
  const [currentHeadshot, setCurrentHeadshot] = useState<HeadshotWithImages | null>(null);
  const [preferences, setPreferences] = useState<GenerationPreference>({});
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);
  const [generatingHeadshot, setGeneratingHeadshot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);

  // Check for success or error params from the URL query
  const { success, canceled, headshot: headshotId } = router.query;

  useEffect(() => {
    // Handle success or canceled payments
    if (success === 'true' && headshotId) {
      toast.success('Payment successful! Your headshot is being generated.');
      // Refresh the headshot data
      if (user) {
        fetchHeadshotDetails(headshotId as string, user.id);
      }
    } else if (canceled === 'true') {
      toast.error('Payment was canceled. Your headshot will not be generated.');
    }
  }, [success, canceled, headshotId, user]);

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
          router.push('/login');
          return;
        }
        
        setUser(session.user);
        
        // Fetch user's headshots
        if (session.user) {
          await fetchHeadshots(session.user.id);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          await fetchHeadshots(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  // Fetch user's headshots
  const fetchHeadshots = async (userId: string) => {
    try {
      const userHeadshots = await getUserHeadshots(userId);
      setHeadshots(userHeadshots);
      
      // If there are headshots, set the first one as current
      if (userHeadshots.length > 0) {
        setCurrentHeadshot(userHeadshots[0]);
      }
    } catch (error) {
      console.error('Error fetching headshots:', error);
      toast.error('Failed to load your headshots');
    }
  };

  // Fetch details for a specific headshot
  const fetchHeadshotDetails = async (id: string, userId: string) => {
    try {
      const headshot = await getHeadshotWithImages(id, userId);
      setCurrentHeadshot(headshot);
      
      // Also update the list of headshots
      await fetchHeadshots(userId);
    } catch (error) {
      console.error('Error fetching headshot details:', error);
      toast.error('Failed to load headshot details');
    }
  };

  // Handle creating a new headshot
  const handleNewHeadshot = async () => {
    if (!user) {
      toast.error('You must be logged in to create a headshot');
      return;
    }

    try {
      // Create a new headshot record
      const newHeadshot = await createHeadshot(user.id);
      
      // Set it as the current headshot
      setCurrentHeadshot(newHeadshot);
      
      // Reset states
      setUploadedImageIds([]);
      setPreferences({});
      setError(null);
      
      // Show the upload form
      setShowUploadForm(true);
      setShowChatInterface(false);
      
      // Refresh the list of headshots
      await fetchHeadshots(user.id);
    } catch (error) {
      console.error('Error creating new headshot:', error);
      toast.error('Failed to create new headshot');
    }
  };

  // Handle uploaded images
  const handleImagesUploaded = (imageIds: string[]) => {
    setUploadedImageIds(prev => [...prev, ...imageIds]);
    toast.success(`${imageIds.length} images uploaded successfully`);
    
    // After uploading, show the chat interface
    setShowUploadForm(false);
    setShowChatInterface(true);
  };

  // Handle preferences from the chat
  const handlePreferencesUpdated = (newPreferences: GenerationPreference) => {
    setPreferences(newPreferences);
  };

  // Generate headshot
  const handleGenerateHeadshot = async () => {
    if (!user || !currentHeadshot || uploadedImageIds.length === 0) {
      toast.error('Please upload at least one image before generating a headshot');
      return;
    }

    try {
      setGeneratingHeadshot(true);
      setError(null);

      // Call the API to generate the headshot
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageIds: uploadedImageIds,
          preferences,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate headshot');
      }

      // Redirect to Stripe Checkout if a URL is provided
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Otherwise, update the current headshot
        await fetchHeadshotDetails(currentHeadshot.id, user.id);
        toast.success('Headshot generation initiated');
      }
    } catch (error) {
      console.error('Error generating headshot:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to generate headshot');
    } finally {
      setGeneratingHeadshot(false);
    }
  };

  // Handle selecting a different headshot
  const handleSelectHeadshot = (headshot: HeadshotWithImages) => {
    setCurrentHeadshot(headshot);
    setShowUploadForm(false);
    setShowChatInterface(false);
  };

  return (
    <Layout user={user} loading={loading} title="Dashboard - headcraftAI">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Your Headshots
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleNewHeadshot}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              New Headshot
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar with previous headshots */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-900">Your Headshots</h3>
            <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {headshots.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-gray-500">
                    No headshots yet. Click &ldquo;New Headshot&rdquo; to create one.
                  </li>
                ) : (
                  headshots.map((headshot) => (
                    <li key={headshot.id}>
                      <button
                        onClick={() => handleSelectHeadshot(headshot)}
                        className={`block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out w-full text-left px-4 py-4 ${
                          currentHeadshot?.id === headshot.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                            {headshot.generated_image ? (
                              <Image
                                src={headshot.generated_image.url}
                                alt={`Headshot from ${new Date(headshot.created_at).toLocaleDateString()}`}
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full">
                                <FiImage className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(headshot.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Status: {headshot.status.charAt(0).toUpperCase() + headshot.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Main headshot display area */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : currentHeadshot ? (
              <div className="space-y-6">
                {/* Headshot display */}
                <HeadshotDisplay
                  headshot={currentHeadshot}
                  isGenerating={generatingHeadshot}
                  error={error}
                />

                {/* Upload form */}
                {showUploadForm && (
                  <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Upload Your Photos
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Upload multiple images of yourself to get the best results.</p>
                      </div>
                      <div className="mt-5">
                        <UploadForm onImagesUploaded={handleImagesUploaded} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat interface */}
                {showChatInterface && (
                  <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Customize Your Headshot
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Tell us your preferences for the final headshot.</p>
                      </div>
                      <div className="mt-5">
                        <ChatInterface onPreferencesUpdated={handlePreferencesUpdated} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate button */}
                {(showUploadForm || showChatInterface) && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerateHeadshot}
                      disabled={generatingHeadshot || uploadedImageIds.length === 0}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        generatingHeadshot || uploadedImageIds.length === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {generatingHeadshot ? (
                        <>
                          <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          Generating...
                        </>
                      ) : (
                        'Generate Headshot'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No headshot selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click on &ldquo;New Headshot&rdquo; to create one.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleNewHeadshot}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                      New Headshot
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;