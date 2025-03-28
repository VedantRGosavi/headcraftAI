// lib/images.ts
import { v4 as uuidv4 } from 'uuid';
import { Image, Headshot, HeadshotWithImages } from '../types/image';

const UPLOADED_FOLDER = 'uploaded';
const GENERATED_FOLDER = 'generated';

// Helper function to upload file to storage
async function uploadFileToStorage(file: File | Blob, filePath: string): Promise<string> {
  try {
    // Ensure filePath is properly formatted
    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', normalizedPath);

    // Upload to your storage API endpoint
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file to storage');
    }

    return data.url;
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw error instanceof Error ? error : new Error('Failed to upload file to storage');
  }
}

/**
 * Upload an image to storage
 * @param file The file to upload
 * @param userId The ID of the user
 * @returns The uploaded image information
 */
export async function uploadImage(file: File, userId: string): Promise<Image> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${UPLOADED_FOLDER}/${userId}/${fileName}`;

    // Upload file to storage
    const publicUrl = await uploadFileToStorage(file, filePath);

    // Store image record through API
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'uploadImage',
        url: publicUrl,
        type: 'uploaded',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to store image record');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}

/**
 * Upload a generated image from a URL to storage
 * @param imageUrl The URL of the generated image
 * @param userId The ID of the user
 * @returns The stored image information
 */
export async function storeGeneratedImage(imageUrl: string, userId: string): Promise<Image> {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch generated image');
    }

    const imageBlob = await response.blob();
    const fileName = `${uuidv4()}.png`;
    const filePath = `${GENERATED_FOLDER}/${userId}/${fileName}`;

    // Upload file to storage
    const publicUrl = await uploadFileToStorage(imageBlob, filePath);

    // Store image record through API
    const apiResponse = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'storeGeneratedImage',
        url: publicUrl,
        type: 'generated',
      }),
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to store generated image record');
    }

    return await apiResponse.json();
  } catch (error) {
    console.error('Error in storeGeneratedImage:', error);
    throw error;
  }
}

/**
 * Create a new headshot
 * @returns The created headshot
 */
export async function createHeadshot(): Promise<Headshot> {
  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createHeadshot',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create headshot');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createHeadshot:', error);
    throw error;
  }
}

/**
 * Update a headshot
 * @param headshotId The ID of the headshot to update
 * @param updates The updates to apply
 * @returns The updated headshot
 */
export async function updateHeadshot(
  headshotId: string,
  updates: {
    status?: string;
    prompt?: string;
    generated_image_id?: string;
  }
): Promise<Headshot> {
  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateHeadshot',
        headshotId,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update headshot');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateHeadshot:', error);
    throw error;
  }
}

/**
 * Get a headshot with its associated images
 * @param headshotId The ID of the headshot
 * @returns The headshot with its images
 */
export async function getHeadshotWithImages(headshotId: string): Promise<HeadshotWithImages> {
  try {
    const response = await fetch(`/api/images?action=getHeadshotWithImages&headshotId=${headshotId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get headshot with images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getHeadshotWithImages:', error);
    throw error;
  }
}

/**
 * Get all headshots for a user
 * @returns Array of headshots with their images
 */
export async function getUserHeadshots(): Promise<HeadshotWithImages[]> {
  try {
    const response = await fetch(`/api/images?action=getUserHeadshots`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get user headshots');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getUserHeadshots:', error);
    throw error;
  }
}

/**
 * Get all uploaded images for a user
 * @returns Array of uploaded images
 */
export async function getUserUploadedImages(): Promise<Image[]> {
  try {
    const response = await fetch(`/api/images?action=getUserUploadedImages`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get user uploaded images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getUserUploadedImages:', error);
    throw error;
  }
}

/**
 * Delete an image
 * @param imageId The ID of the image to delete
 * @returns True if successful
 */
export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/images`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}