// components/shared/UploadForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useUser } from '@stackframe/stack';
import { uploadImage } from '../../lib/images';
import { UploadedImage } from '../../types/image';

interface UploadFormProps {
  onImagesUploaded: (imageIds: string[]) => void;
  maxImages?: number;
  buttonText?: string;
  disabled?: boolean;
}

const UploadForm: React.FC<UploadFormProps> = ({
  onImagesUploaded,
  maxImages = 5,
  buttonText = 'Upload Images',
  disabled = false,
}) => {
  const currentUser = useUser();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check if we're going to exceed the max number of images
    if (images.length + acceptedFiles.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    // Process each file
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }));

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, maxImages]);

  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    disabled: disabled || uploading || images.length >= maxImages,
    maxSize: 10485760, // 10MB
  });

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  // Remove an image from the list
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Upload all images
  const handleUpload = async () => {
    try {
      setUploading(true);
      setError(null);

      if (!currentUser) {
        throw new Error('You must be logged in to upload images');
      }

      const uploadPromises = images
        .filter(image => !image.uploaded)
        .map(async (image) => {
          try {
            const uploadedImage = await uploadImage(image.file, currentUser.id);
            return uploadedImage.id;
          } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
          }
        });

      const uploadedImageIds = await Promise.all(uploadPromises);
      
      // Update local state to mark images as uploaded
      setImages(prev => prev.map(image => ({ ...image, uploaded: true })));
      
      // Notify parent component
      onImagesUploaded(uploadedImageIds);
      
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error in handleUpload:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        } ${disabled || uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop some images here, or click to select files
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {`Upload up to ${maxImages} images. Each image must be less than 10MB.`}
        </p>
      </div>

      {/* Display uploaded/selected images */}
      {images.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Selected Images ({images.length}/{maxImages})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={image.preview}
                  alt={`Upload preview ${index + 1}`}
                  width={300}
                  height={160}
                  className="w-full h-40 object-cover"
                  style={{
                    maxWidth: '100%',
                    height: '160px',
                  }}
                />
                <button
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  <FiX />
                </button>
                {image.uploaded && (
                  <div className="absolute bottom-2 right-2 p-1 rounded-full bg-green-500 text-white">
                    <FiCheck />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Upload button */}
      {images.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={disabled || uploading || images.every(img => img.uploaded)}
          className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium 
            ${
              disabled || uploading || images.every(img => img.uploaded)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {uploading ? (
            <>
              <span className="animate-spin inline-block h-4 w-4 mr-2 border-t-2 border-white rounded-full"></span>
              Uploading...
            </>
          ) : images.every(img => img.uploaded) ? (
            'All Images Uploaded'
          ) : (
            buttonText
          )}
        </button>
      )}
    </div>
  );
};

export default UploadForm;