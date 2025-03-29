'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '../types/image';
import { getUserUploadedImages, getUserHeadshots } from '../lib/images';

export default function DashboardContent() {
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);
  const [headshots, setHeadshots] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadUserData() {
      try {
        setLoading(true);
        setError(null);
        
        // Store the loading state in a local variable to avoid dependency issues
        const currentlyLoading = true;

        // Add timeout to prevent infinite loading state
        const timeout = setTimeout(() => {
          if (isMounted && currentlyLoading) {
            setLoading(false);
            setError('Request timed out. Please refresh and try again.');
          }
        }, 10000);

        // Wrap each promise in a catch to prevent one failure from stopping both
        const uploadedImagesPromise = getUserUploadedImages().catch(err => {
          console.error('Error fetching uploaded images:', err);
          return [];
        });
        
        const headshotsPromise = getUserHeadshots().catch(err => {
          console.error('Error fetching headshots:', err);
          return [];
        });

        const [images, userHeadshots] = await Promise.all([
          uploadedImagesPromise,
          headshotsPromise
        ]);

        clearTimeout(timeout);
        
        if (isMounted) {
          setUploadedImages(images || []);
          setHeadshots(userHeadshots || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (isMounted) {
          setError('Failed to load your data. Please refresh the page.');
          setLoading(false);
        }
      }
    }

    loadUserData();
    
    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, []); // No dependencies needed with this approach

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

      <div className="space-y-8">
        {/* Uploaded Images Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Uploaded Images</h2>
          {uploadedImages.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-500">No uploaded images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image
                      src={image.url}
                      alt="Uploaded image"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      Uploaded on {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Generated Headshots Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Generated Headshots</h2>
          {headshots.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-500">No generated headshots yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {headshots.map((headshot) => (
                <div key={headshot.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image
                      src={headshot.url}
                      alt="Generated headshot"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      Generated on {new Date(headshot.created_at).toLocaleDateString()}
                    </p>
                    {headshot.status && (
                      <p className={`text-sm mt-2 ${
                        headshot.status === 'completed' ? 'text-green-600' :
                        headshot.status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        Status: {headshot.status.charAt(0).toUpperCase() + headshot.status.slice(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}