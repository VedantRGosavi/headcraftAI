// pages/api/upload/generate.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/neondb';
import { analyzeImages, generateHeadshotPrompt, generateHeadshot } from '../../../lib/openai';
import { createHeadshot, storeGeneratedImage, updateHeadshot, getUserUploadedImages } from '../../../lib/images';
import { createCheckoutSession } from '../../../lib/stripe';
import { GenerationPreference } from '../../../types/image';

export async function POST(req: Request) {
  try {
    // Check auth
    const { data: session, error: authError } = await supabaseAdmin.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageIds, preferences = {} } = body as {
      imageIds: string[];
      preferences?: GenerationPreference;
    };

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ error: 'No image IDs provided' }, { status: 400 });
    }

    // Create a headshot record
    const headshot = await createHeadshot(userId);

    // Get image URLs from the database
    const uploadedImages = await getUserUploadedImages(userId);
    const selectedImages = uploadedImages.filter(img => imageIds.includes(img.id));

    if (selectedImages.length === 0) {
      return NextResponse.json({ error: 'No valid images found' }, { status: 400 });
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

    return NextResponse.json({
      headshot,
      checkoutUrl,
      message: 'Headshot generation initiated',
    });
  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json({ error: 'Failed to generate headshot' }, { status: 500 });
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