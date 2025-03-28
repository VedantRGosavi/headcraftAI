// components/shared/HeadshotDisplay.tsx
import React from 'react';
import Image from 'next/image';
import { FiDownload, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { HeadshotWithImages } from '../../types/image';

interface HeadshotDisplayProps {
  headshot: HeadshotWithImages;
  isGenerating?: boolean;
  error?: string | null;
}

const HeadshotDisplay: React.FC<HeadshotDisplayProps> = ({
  headshot,
  isGenerating = false,
  error = null,
}) => {
  // Function to download the headshot image
  const handleDownload = async () => {
    if (!headshot.generated_image?.url) return;
    
    try {
      const response = await fetch(headshot.generated_image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `headshot-${headshot.id}.png`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading image:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  // Status badge component
  const StatusBadge = () => {
    switch (headshot.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden border bg-white shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Generated Headshot</h3>
          <StatusBadge />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(headshot.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Image display area */}
      <div
        className="h-80 bg-gray-100 flex items-center justify-center p-4"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {isGenerating ? (
          <div className="text-center">
            <FiLoader className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
            <p className="mt-4 text-gray-600">Generating your headshot...</p>
            <p className="mt-2 text-gray-500 text-sm">This may take a minute or two</p>
          </div>
        ) : headshot.status === 'failed' || error ? (
          <div className="text-center">
            <FiAlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-red-600">
              {error || 'Failed to generate headshot'}
            </p>
          </div>
        ) : headshot.generated_image ? (
          <Image
            src={headshot.generated_image.url}
            alt="Generated headshot"
            className="max-w-full max-h-full object-contain"
            width={500}
            height={500}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-500">No headshot generated yet</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {headshot.status === 'completed' && headshot.generated_image && (
        <div className="p-4 border-t flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Your headshot is ready to download!
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiDownload className="inline-block mr-1" />
            Download
          </button>
        </div>
      )}

      {/* Display prompt used (if available) */}
      {headshot.prompt && (
        <div className="p-4 border-t">
          <h4 className="text-sm font-medium text-gray-700">Generated using:</h4>
          <p className="mt-1 text-xs text-gray-500 whitespace-pre-wrap">
            {headshot.prompt}
          </p>
        </div>
      )}
    </div>
  );
};

export default HeadshotDisplay;