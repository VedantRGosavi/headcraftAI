'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@stackframe/stack';
import { getUserUploadedImages, getUserHeadshots } from '../lib/images';
import { Image as ImageType, HeadshotWithImages } from '../types/image';
import UploadForm from './shared/UploadForm';
import HeadshotDisplay from './shared/HeadshotDisplay';
import { formatDistanceToNow } from 'date-fns';
import { PhotoIcon } from '@heroicons/react/24/outline';

const DashboardContent = () => {
  const user = useUser();
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);
  const [headshots, setHeadshots] = useState<HeadshotWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [images, userHeadshots] = await Promise.all([
          getUserUploadedImages(user.id).catch((err) => {
            console.error('Error loading uploaded images:', err);
            return [];
          }),
          getUserHeadshots(user.id).catch((err) => {
            console.error('Error loading headshots:', err);
            return [];
          }),
        ]);

        setUploadedImages(images || []);
        setHeadshots(userHeadshots || []);
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load your data. Please refresh the page.');
        setUploadedImages([]);
        setHeadshots([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleImagesUploaded = async () => {
    if (!user) return;
    try {
      const images = await getUserUploadedImages(user.id);
      setUploadedImages(images);
    } catch (error) {
      console.error('Error reloading uploaded images:', error);
      setError('Failed to reload uploaded images.');
    }
  };

  const handleGenerateHeadshot = async () => {
    if (!user) {
      setError('Please log in to generate headshots.');
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/upload/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageIds: uploadedImages.map((img) => img.id),
          preferences: { prompt: preferences },
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate headshot');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        const userHeadshots = await getUserHeadshots(user.id);
        setHeadshots(userHeadshots);
      }
    } catch (error) {
      console.error('Error generating headshot:', error);
      setError('Failed to generate headshot. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">
          Please log in to access your dashboard
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gray-50 py-8 px-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to your dashboard!</h2>
        <p className="mt-2 text-gray-600">
          Upload your photos to generate professional headshots.
        </p>
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

      {/* Uploaded Images Section */}
      {uploadedImages.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900">Your Uploaded Photos</h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="relative rounded-lg overflow-hidden border border-gray-200"
              >
                <Image
                  src={image.url}
                  alt={`Uploaded image from ${formatDistanceToNow(
                    new Date(image.created_at),
                    { addSuffix: true }
                  )}`}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                  style={{ maxWidth: '100%', height: '160px' }}
                />
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-500 truncate">
                    Uploaded{' '}
                    {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="mb-4">
              <label
                htmlFor="preferences"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Headshot Preferences
              </label>
              <textarea
                id="preferences"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 'Professional attire with a blue background and natural lighting'"
                onChange={(e) => setPreferences(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              All uploaded images will be used to generate your headshot.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleGenerateHeadshot}
                disabled={generating || !uploadedImages.length}
                title={
                  generating
                    ? 'Generating in progress'
                    : !uploadedImages.length
                    ? 'Upload images to generate headshot'
                    : ''
                }
                className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${
                  generating || !uploadedImages.length
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {generating ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Headshot'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Headshots Section */}
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
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">Loading your content...</p>
        </div>
      ) : (
        uploadedImages.length === 0 &&
        headshots.length === 0 && (
          <div className="bg-white shadow sm:rounded-lg p-6 text-center py-8">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No content yet</h3>
            <p className="mt-1 text-gray-600">
              Start by uploading your photos above to generate professional headshots.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default DashboardContent;