import { NextResponse } from 'next/server';
import { stackServerApp } from '../../../../stack';
import { analyzeImages, generateHeadshotPrompt, generateHeadshot } from '../../../../lib/openai';
import { createHeadshot, storeGeneratedImage, updateHeadshot, getUserUploadedImages } from '../../../../lib/images';
import { createCheckoutSession } from '../../../../lib/stripe';
import { GenerationPreference } from '../../../../types/image';

export async function POST(req: Request) {
  try {
    // Check auth using Stack
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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

    // Create a checkout session for payment
    const checkoutUrl = await createCheckoutSession(userId, headshot.id);

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Error in headshot generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate headshot' },
      { status: 500 }
    );
  }
}

async function generateHeadshotProcess(
  userId: string,
  headshotId: string,
  imageUrls: string[],
  preferences: GenerationPreference
) {
  try {
    // Update status to processing
    await updateHeadshot(headshotId, { status: 'processing' });

    // Analyze images and generate base description
    const baseDescription = await analyzeImages(imageUrls);

    // Generate final prompt incorporating user preferences
    const prompt = await generateHeadshotPrompt(baseDescription, preferences);

    // Generate the headshot using DALL-E 3
    const generatedImageUrl = await generateHeadshot(prompt);

    // Store the generated image
    await storeGeneratedImage(headshotId, generatedImageUrl);

    // Update status to completed
    await updateHeadshot(headshotId, { status: 'completed' });
  } catch (error) {
    console.error('Error in headshot generation process:', error);
    await updateHeadshot(headshotId, { status: 'failed' });
    throw error;
  }
} 