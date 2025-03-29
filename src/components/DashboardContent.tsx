'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageType } from '../types/image';
import { getUserUploadedImages, getUserHeadshots, uploadImage, createHeadshot } from '../lib/images';
import { stackClient } from '../lib/stack-client';

interface User {
  id?: string;
  email?: string;
  name?: string;
}

export default function DashboardContent() {
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);
  const [headshots, setHeadshots] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      
      const user = await stackClient.getUser() as unknown as User;
      const userId = user?.id || 'guest';
      
      const file = files[0];
      const uploadedImage = await uploadImage({
        file,
        userId
      });
      
      // Add the new image to state
      setUploadedImages(prev => [uploadedImage, ...prev]);
      
      // Select the uploaded image for headshot generation
      setSelectedImage(uploadedImage.id);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleGenerateHeadshots = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }
    
    try {
      setGenerating(true);
      
      // Find the selected image
      const image = uploadedImages.find(img => img.id === selectedImage);
      if (!image) {
        throw new Error('Selected image not found');
      }
      
      // Create a new headshot generation process
      const headshot = await createHeadshot();
      
      // In a real app, you would start a job to generate headshots here
      // For now, we'll simulate it by adding a placeholder
      const placeholderHeadshot: ImageType = {
        id: headshot.id || 'temp-' + Date.now(),
        url: image.url, // Use original image as placeholder
        type: 'headshot',
        user_id: image.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'processing'
      };
      
      // Add the placeholder to state
      setHeadshots(prev => [placeholderHeadshot, ...prev]);
      
    } catch (error) {
      console.error('Error generating headshots:', error);
      setError('Failed to generate headshots. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

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

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Image
            </>
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          onClick={handleGenerateHeadshots}
          disabled={generating || !selectedImage}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          {generating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Generate Headshots
            </>
          )}
        </button>
      </div>

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
                <div 
                  key={image.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer ${selectedImage === image.id ? 'ring-2 ring-indigo-500' : ''}`}
                  onClick={() => setSelectedImage(image.id)}
                >
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