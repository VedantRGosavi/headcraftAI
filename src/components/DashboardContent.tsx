'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@stackframe/stack';
import { getUserUploadedImages, getUserHeadshots } from '../lib/images';
import { Image as ImageType, HeadshotWithImages } from '../types/image';
import UploadForm from './shared/UploadForm';
import HeadshotDisplay from './shared/HeadshotDisplay';

const DashboardContent = () => {
  const user = useUser();
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);
  const [headshots, setHeadshots] = useState<HeadshotWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState('');

  useEffect(() => {
    // Load user's images and headshots when component mounts
    const loadUserData = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [images, userHeadshots] = await Promise.all([
          getUserUploadedImages(user.id).catch(err => {
            console.error('Error loading uploaded images:', err);
            return [];
          }),
          getUserHeadshots(user.id).catch(err => {
            console.error('Error loading headshots:', err);
            return [];
          }),
        ]);
        
        setUploadedImages(images || []);
        setHeadshots(userHeadshots || []);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set empty arrays to prevent null errors
        setUploadedImages([]);
        setHeadshots([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleImagesUploaded = async () => {
    // Reload user's images after new uploads
    if (!user) return;
    try {
      const images = await getUserUploadedImages(user.id);
      setUploadedImages(images);
    } catch (error) {
      console.error('Error reloading uploaded images:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Please log in to access your dashboard</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to your dashboard!</h2>
        <p className="mt-2 text-gray-600">Upload your photos to generate professional headshots.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900">Upload Photos</h3>
        <div className="mt-4">
          <UploadForm
            onImagesUploaded={handleImagesUploaded}
            maxImages={5}
            buttonText="Upload Images"
            disabled={loading}
          />
        </div>
      </div>

      {/* User's Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900">Your Uploaded Photos</h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={image.url}
                  alt="Uploaded image"
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                  style={{
                    maxWidth: '100%',
                    height: '160px',
                  }}
                />
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-500 truncate">
                    {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="mb-4">
              <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                Headshot Preferences
              </label>
              <textarea
                id="preferences"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your preferences (e.g., background color, lighting, style, expression)"
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Call the generate API with the selected images and preferences
                  fetch('/api/upload/generate', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      imageIds: uploadedImages.map(img => img.id),
                      preferences: {
                        prompt: preferences
                      }
                    }),
                  })
                  .then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to generate headshot');
                    }
                    // Redirect to checkout if needed
                    if (data.checkoutUrl) {
                      window.location.href = data.checkoutUrl;
                    }
                  })
                  .catch((error) => {
                    console.error('Error generating headshot:', error);
                    alert('Failed to generate headshot. Please try again.');
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Generate Headshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Headshots */}
      {headshots.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Your Generated Headshots</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {headshots.map((headshot) => (
              <HeadshotDisplay key={headshot.id} headshot={headshot} />
            ))}
          </div>
        </div>
      )}

      {/* Loading/Empty State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your content...</p>
        </div>
      ) : (uploadedImages.length === 0 && headshots.length === 0) && (
        <div className="bg-white shadow sm:rounded-lg p-6 text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">No content yet</h3>
          <p className="text-gray-600 mb-6">Start by uploading your photos above to generate professional headshots.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardContent; 