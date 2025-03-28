// pages/api/upload/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase';
import { analyzeImages, generateHeadshotPrompt, generateHeadshot } from '../../../lib/openai';
import { createHeadshot, storeGeneratedImage, updateHeadshot, getUserUploadedImages } from '../../../lib/images';
import { createCheckoutSession } from '../../../lib/stripe';
import { GenerationPreference } from '../../../types/image';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check auth
  const { data: session, error: authError } = await supabaseAdmin.auth.getSession();

  if (authError || !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.session?.user.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { imageIds, preferences = {} } = req.body as {
      imageIds: string[];
      preferences?: GenerationPreference;
    };

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ error: 'No image IDs provided' });
    }

    // Create a headshot record
    const headshot = await createHeadshot(userId);

    // Get image URLs from the database
    const uploadedImages = await getUserUploadedImages(userId);
    const selectedImages = uploadedImages.filter(img => imageIds.includes(img.id));

    if (selectedImages.length === 0) {
      return res.status(400).json({ error: 'No valid images found' });
    }

    const imageUrls = selectedImages.map(img => img.url);

    // Start the generation process in the background
    generateHeadshotProcess(userId, headshot.id, imageUrls, preferences).catch(error => {
      console.error('Error in headshot generation process:', error);
      updateHeadshot(headshot.id, { status: 'failed' }).catch(err => {
        console.error('Error updating failed headshot status:', err);
      });
    });

    // Create a Stripe checkout session for payment
    const checkoutUrl = await createCheckoutSession(userId, headshot.id);

    return res.status(200).json({
      headshot,
      checkoutUrl,
      message: 'Headshot generation initiated',
    });
  } catch (error) {
    console.error('Error in generate API:', error);
    return res.status(500).json({ error: 'Failed to generate headshot' });
  }
}

// Process to generate a headshot
async function generateHeadshotProcess(
  userId: string,
  headshotId: string,
  imageUrls: string[],
  preferences: GenerationPreference
): Promise<void> {
  try {
    // Update headshot status to processing
    await updateHeadshot(headshotId, { status: 'processing' });

    // Step 1: Analyze the images to get a base description
    const baseDescription = await analyzeImages(imageUrls);

    // Step 2: Generate the DALL-E prompt using the base description and user preferences
    const prompt = await generateHeadshotPrompt(baseDescription, preferences);

    // Update headshot with the prompt
    await updateHeadshot(headshotId, { prompt });

    // Step 3: Generate the headshot with DALL-E
    const generatedImageUrl = await generateHeadshot(prompt);

    // Step 4: Store the generated image
    const storedImage = await storeGeneratedImage(generatedImageUrl, userId);

    // Step 5: Update the headshot record with the generated image ID and completed status
    await updateHeadshot(headshotId, {
      generated_image_id: storedImage.id,
      status: 'completed',
    });
  } catch (error) {
    console.error('Error in headshot generation process:', error);
    
    // Update headshot status to failed
    await updateHeadshot(headshotId, { status: 'failed' });
    
    throw error;
  }
}