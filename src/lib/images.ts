// lib/images.ts
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import { Image, Headshot, HeadshotWithImages } from '../types/image';
import { del } from '@vercel/blob';

type MockResult = {
  uploadImage: Image;
  storeGeneratedImage: Image;
  createHeadshot: Headshot;
  updateHeadshot: Headshot;
  getHeadshotWithImages: HeadshotWithImages;
  getUserHeadshots: HeadshotWithImages[];
  getUserUploadedImages: Image[];
  query: Image[];
};

// Helper function to get a mock result based on function name
function getMockResult<T extends keyof MockResult>(functionName: T): MockResult[T] {
  console.log(`Using mock for ${functionName}`);
  
  const mockImage: Image = {
    id: 'mock-id',
    url: 'https://example.com/mock-image.jpg',
    type: 'uploaded',
    created_at: new Date().toISOString(),
    user_id: 'mock-user-id'
  };

  const mockHeadshot: Headshot = {
    id: 'mock-headshot-id',
    status: 'completed',
    created_at: new Date().toISOString(),
    user_id: 'mock-user-id',
    prompt: '',
    generated_image_id: null,
    updated_at: new Date().toISOString()
  };

  const mockHeadshotWithImages: HeadshotWithImages = {
    id: 'mock-headshot-id',
    status: 'completed',
    created_at: new Date().toISOString(),
    user_id: 'mock-user-id',
    prompt: '',
    generated_image_id: 'mock-image-id',
    updated_at: new Date().toISOString(),
    generated_image: { 
      id: 'mock-image-id',
      url: 'https://example.com/mock-generated.jpg',
      type: 'generated',
      created_at: new Date().toISOString(),
      user_id: 'mock-user-id'
    },
    uploaded_images: []
  };

  switch (functionName) {
    case 'uploadImage':
    case 'storeGeneratedImage':
      return mockImage as MockResult[T];
    case 'createHeadshot':
    case 'updateHeadshot':
      return mockHeadshot as MockResult[T];
    case 'getHeadshotWithImages':
      return mockHeadshotWithImages as MockResult[T];
    case 'getUserHeadshots':
      return [mockHeadshotWithImages] as MockResult[T];
    case 'getUserUploadedImages':
      return [mockImage] as MockResult[T];
    case 'query':
    default:
      return [mockImage] as MockResult[T];
  }
}

// Use a real database connection only in production runtime
const isServerRuntime = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && process.env.VERCEL_ENV;
const db = isServerRuntime ? neon(process.env.DATABASE_URL || '') : null;

const UPLOADED_FOLDER = 'uploaded';
const GENERATED_FOLDER = 'generated';

// Helper function to execute SQL queries
async function executeQuery<T>(query: string, params: unknown[] = []): Promise<T[]> {
  if (!db) {
    return getMockResult('query') as T[];
  }
  const result = await db(query, params);
  return result as T[];
}

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

    // Insert record in the database
    const result = await executeQuery<Image>(
      'INSERT INTO images (user_id, type, url) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'uploaded', publicUrl]
    );

    return result[0];
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

    // Insert record in the database
    const result = await executeQuery<Image>(
      'INSERT INTO images (user_id, type, url) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'generated', publicUrl]
    );

    return result[0];
  } catch (error) {
    console.error('Error in storeGeneratedImage:', error);
    throw error;
  }
}

/**
 * Create a new headshot record
 * @param userId The ID of the user
 * @returns The created headshot record
 */
export async function createHeadshot(userId: string): Promise<Headshot> {
  try {
    const result = await executeQuery<Headshot>(
      'INSERT INTO headshots (user_id, status) VALUES ($1, $2) RETURNING *',
      [userId, 'pending']
    );

    return result[0];
  } catch (error) {
    console.error('Error in createHeadshot:', error);
    throw error;
  }
}

/**
 * Update a headshot record
 * @param headshotId The ID of the headshot
 * @param updates The updates to apply
 * @returns The updated headshot record
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
    const result = await executeQuery<Headshot>(
      'UPDATE headshots SET status = COALESCE($1, status), prompt = COALESCE($2, prompt), generated_image_id = COALESCE($3, generated_image_id), updated_at = NOW() WHERE id = $4 RETURNING *',
      [updates.status, updates.prompt, updates.generated_image_id, headshotId]
    );

    return result[0];
  } catch (error) {
    console.error('Error in updateHeadshot:', error);
    throw error;
  }
}

/**
 * Get a headshot with associated images
 * @param headshotId The ID of the headshot
 * @param userId The ID of the user
 * @returns The headshot with associated images
 */
export async function getHeadshotWithImages(headshotId: string, userId: string): Promise<HeadshotWithImages> {
  try {
    // Get the headshot with its generated image
    const headshot = await executeQuery<HeadshotWithImages>(
      'SELECT h.*, g.* as generated_image FROM headshots h LEFT JOIN images g ON h.generated_image_id = g.id WHERE h.id = $1 AND h.user_id = $2',
      [headshotId, userId]
    );

    // Get uploaded images for the user
    const uploadedImages = await executeQuery<Image>(
      'SELECT * FROM images WHERE user_id = $1 AND type = $2',
      [userId, 'uploaded']
    );

    return {
      ...headshot[0],
      uploaded_images: uploadedImages,
    };
  } catch (error) {
    console.error('Error in getHeadshotWithImages:', error);
    throw error;
  }
}

/**
 * Get all headshots for a user
 * @param userId The ID of the user
 * @returns An array of headshots with their generated images
 */
export async function getUserHeadshots(userId: string): Promise<HeadshotWithImages[]> {
  try {
    const result = await executeQuery<HeadshotWithImages>(
      'SELECT h.*, g.* as generated_image FROM headshots h LEFT JOIN images g ON h.generated_image_id = g.id WHERE h.user_id = $1 ORDER BY h.created_at DESC',
      [userId]
    );

    return result;
  } catch (error) {
    console.error('Error in getUserHeadshots:', error);
    throw error;
  }
}

/**
 * Get all uploaded images for a user
 * @param userId The ID of the user
 * @returns An array of uploaded images
 */
export async function getUserUploadedImages(userId: string): Promise<Image[]> {
  try {
    const result = await executeQuery<Image>(
      'SELECT * FROM images WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC',
      [userId, 'uploaded']
    );
    return result;
  } catch (error) {
    console.error('Error in getUserUploadedImages:', error);
    throw error;
  }
}

/**
 * Delete an image
 * @param imageId The ID of the image to delete
 * @param userId The ID of the user
 * @returns Success status
 */
export async function deleteImage(imageId: string, userId: string): Promise<boolean> {
  try {
    // Get the image first to get its URL
    const images = await executeQuery<Image>(
      'SELECT * FROM images WHERE id = $1 AND user_id = $2',
      [imageId, userId]
    );

    if (!images[0]) {
      throw new Error('Image not found');
    }

    // Delete from Vercel Blob storage
    try {
      await del(images[0].url);
    } catch (error) {
      console.error('Error deleting from Blob storage:', error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await executeQuery<Image>(
      'DELETE FROM images WHERE id = $1 AND user_id = $2',
      [imageId, userId]
    );

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}