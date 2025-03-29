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
    async function loadUserData() {
      try {
        setLoading(true);
        setError(null);

        const [images, userHeadshots] = await Promise.all([
          getUserUploadedImages(),
          getUserHeadshots()
        ]);

        setUploadedImages(images || []);
        setHeadshots(userHeadshots || []);
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load your data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
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
        </section>

        {/* Generated Headshots Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Generated Headshots</h2>
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
        </section>
      </div>
    </div>
  );
}