'use client';

import { useState } from 'react';
import { User } from '../types/user';
import { FiUpload, FiDownload } from 'react-icons/fi';

interface DashboardContentProps {
  user: User;
}

const DashboardContent: React.FC<DashboardContentProps> = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      // Upload logic here
      console.log('Uploading files:', selectedFiles);
      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGenerating(true);
      // Mock generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Mock generated images
      setGeneratedImages(['/images/headshot-example.jpg']);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="mt-2 text-gray-600">Upload your photos to generate professional headshots.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900">Upload Photos</h3>
        <div className="mt-4">
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <FiUpload className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : 'Click to upload or drag and drop'}
              </span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading || generating}
              />
            </label>
          </div>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading || generating}
            className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : generating ? 'Generating...' : 'Generate Headshots'}
          </button>
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Generated Headshots</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generatedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Generated headshot ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-50">
                  <FiDownload className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent; 