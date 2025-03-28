// lib/images.ts
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import { Image, Headshot, HeadshotWithImages } from '../types/image';

const sql = neon(process.env.DATABASE_URL!);
const UPLOADED_FOLDER = 'uploaded';
const GENERATED_FOLDER = 'generated';

// Helper function to upload file to storage
async function uploadFileToStorage(file: File | Blob, filePath: string): Promise<string> {
  try {
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);

    // Upload to your storage API endpoint
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to storage');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw error;
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
    const result = await sql`
      INSERT INTO images (user_id, type, url)
      VALUES (${userId}, 'uploaded', ${publicUrl})
      RETURNING *;
    ` as unknown as Image[];

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
    const result = await sql`
      INSERT INTO images (user_id, type, url)
      VALUES (${userId}, 'generated', ${publicUrl})
      RETURNING *;
    ` as unknown as Image[];

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
    const result = await sql`
      INSERT INTO headshots (user_id, status)
      VALUES (${userId}, 'pending')
      RETURNING *;
    ` as unknown as Headshot[];

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
    const result = await sql`
      UPDATE headshots
      SET
        status = COALESCE(${updates.status}, status),
        prompt = COALESCE(${updates.prompt}, prompt),
        generated_image_id = COALESCE(${updates.generated_image_id}, generated_image_id),
        updated_at = NOW()
      WHERE id = ${headshotId}
      RETURNING *;
    ` as unknown as Headshot[];

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
    const headshot = await sql`
      SELECT h.*, g.* as generated_image
      FROM headshots h
      LEFT JOIN images g ON h.generated_image_id = g.id
      WHERE h.id = ${headshotId}
      AND h.user_id = ${userId};
    ` as unknown as HeadshotWithImages[];

    // Get uploaded images for the user
    const uploadedImages = await sql`
      SELECT *
      FROM images
      WHERE user_id = ${userId}
      AND type = 'uploaded';
    ` as unknown as Image[];

    return {
      ...headshot[0],
      uploaded_images: uploadedImages,
    } as HeadshotWithImages;
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
    const result = await sql`
      SELECT h.*, g.* as generated_image
      FROM headshots h
      LEFT JOIN images g ON h.generated_image_id = g.id
      WHERE h.user_id = ${userId}
      ORDER BY h.created_at DESC;
    ` as unknown as HeadshotWithImages[];

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
    const result = await sql`
      SELECT *
      FROM images
      WHERE user_id = ${userId}
      AND type = 'uploaded'
      ORDER BY created_at DESC;
    ` as unknown as Image[];

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
    const image = await sql`
      SELECT *
      FROM images
      WHERE id = ${imageId}
      AND user_id = ${userId};
    ` as unknown as Image[];

    if (!image[0]) {
      throw new Error('Image not found');
    }

    // TODO: Implement file deletion from your preferred storage solution

    // Delete from database
    await sql`
      DELETE FROM images
      WHERE id = ${imageId}
      AND user_id = ${userId};
    `;

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}