// lib/images.ts
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient, supabaseAdmin, STORAGE_BUCKET, UPLOADED_FOLDER, GENERATED_FOLDER } from './supabase';
import { Image, Headshot, HeadshotWithImages } from '../types/image';

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param userId The ID of the user
 * @returns The uploaded image information
 */
export async function uploadImage(file: File, userId: string): Promise<Image> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .upload(`${UPLOADED_FOLDER}/${filePath}`, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${UPLOADED_FOLDER}/${filePath}`);

    // Insert record in the database
    const { data, error } = await supabaseClient
      .from('images')
      .insert({
        user_id: userId,
        type: 'uploaded',
        url: urlData.publicUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting image record:', error);
      throw new Error(error.message);
    }

    return data as Image;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}

/**
 * Upload a generated image from a URL to Supabase Storage
 * @param imageUrl The URL of the generated image
 * @param userId The ID of the user
 * @returns The stored image information
 */
export async function storeGeneratedImage(imageUrl: string, userId: string): Promise<Image> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Generate a unique file name
    const fileName = `${uuidv4()}.png`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(`${GENERATED_FOLDER}/${filePath}`, blob);

    if (uploadError) {
      console.error('Error uploading generated image:', uploadError);
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${GENERATED_FOLDER}/${filePath}`);

    // Insert record in the database
    const { data, error } = await supabaseAdmin
      .from('images')
      .insert({
        user_id: userId,
        type: 'generated',
        url: urlData.publicUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting generated image record:', error);
      throw new Error(error.message);
    }

    return data as Image;
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
    const { data, error } = await supabaseClient
      .from('headshots')
      .insert({
        user_id: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating headshot record:', error);
      throw new Error(error.message);
    }

    return data as Headshot;
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
    const { data, error } = await supabaseAdmin
      .from('headshots')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', headshotId)
      .select()
      .single();

    if (error) {
      console.error('Error updating headshot record:', error);
      throw new Error(error.message);
    }

    return data as Headshot;
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
    // Get the headshot
    const { data: headshot, error: headshotError } = await supabaseClient
      .from('headshots')
      .select('*, generated_image:generated_image_id(*)')
      .eq('id', headshotId)
      .eq('user_id', userId)
      .single();

    if (headshotError) {
      console.error('Error getting headshot:', headshotError);
      throw new Error(headshotError.message);
    }

    // Get uploaded images for the user
    const { data: uploadedImages, error: imagesError } = await supabaseClient
      .from('images')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'uploaded');

    if (imagesError) {
      console.error('Error getting uploaded images:', imagesError);
      throw new Error(imagesError.message);
    }

    return {
      ...headshot,
      uploaded_images: uploadedImages as Image[],
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
    const { data, error } = await supabaseClient
      .from('headshots')
      .select('*, generated_image:generated_image_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user headshots:', error);
      throw new Error(error.message);
    }

    return data as HeadshotWithImages[];
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
    const { data, error } = await supabaseClient
      .from('images')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'uploaded')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user uploaded images:', error);
      throw new Error(error.message);
    }

    return data as Image[];
  } catch (error) {
    console.error('Error in getUserUploadedImages:', error);
    throw error;
  }
}

/**
 * Delete an image
 * @param imageId The ID of the image
 * @param userId The ID of the user (for verification)
 * @returns Success status
 */
export async function deleteImage(imageId: string, userId: string): Promise<boolean> {
  try {
    // Get the image to check ownership and get the URL
    const { data: image, error: getError } = await supabaseClient
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', userId)
      .single();

    if (getError) {
      console.error('Error getting image for deletion:', getError);
      throw new Error(getError.message);
    }

    if (!image) {
      throw new Error('Image not found or not owned by user');
    }

    // Extract the path from the URL
    const url = new URL(image.url);
    const pathParts = url.pathname.split('/');
    const storagePath = pathParts.slice(pathParts.indexOf(STORAGE_BUCKET) + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      console.error('Error deleting image from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabaseClient
      .from('images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId);

    if (dbError) {
      console.error('Error deleting image from database:', dbError);
      throw new Error(dbError.message);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}