import { NextResponse } from 'next/server';
import { stackServerApp } from '../../../../stack';
import { analyzeImages, generateHeadshotPrompt, generateHeadshot } from '../../../../lib/openai';
import { createHeadshot, storeGeneratedImage, updateHeadshot, getUserUploadedImages } from '../../../../lib/images';
import { createCheckoutSession } from '../../../../lib/stripe';
import { GenerationPreference } from '../../../../types/image';

export async function POST(req: Request) {
  try {
    // Check authentication using Stack
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Parse and validate request body
    const body = await req.json();
    const { imageIds, preferences = {} } = body as {
      imageIds: string[];
      preferences?: GenerationPreference;
    };

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ error: 'No image IDs provided' }, { status: 400 });
    }

    // Validate that imageIds belong to the user
    const uploadedImages = await getUserUploadedImages(userId);
    const selectedImages = uploadedImages.filter((img) => imageIds.includes(img.id));

    if (selectedImages.length !== imageIds.length) {
      return NextResponse.json(
        { error: 'One or more image IDs are invalid or unauthorized' },
        { status: 400 }
      );
    }

    // Create a headshot record
    const headshot = await createHeadshot(userId);

    const imageUrls = selectedImages.map((img) => img.url);

    // Start the generation process in the background with a timeout
    const generationPromise = generateHeadshotProcess(userId, headshot.id, imageUrls, preferences);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Headshot generation timed out')), 60000) // 60-second timeout
    );

    Promise.race([generationPromise, timeoutPromise]).catch(async (error) => {
      console.error('Background headshot generation failed:', error instanceof Error ? error.message : 'Unknown error');
      await updateHeadshot(headshot.id, { status: 'failed' });
    });

    // Create a checkout session for payment
    const checkoutUrl = await createCheckoutSession(userId, headshot.id);

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Error initiating headshot generation:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to initiate headshot generation' },
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
    console.log(`Headshot ${headshotId} processing started for user ${userId}`);

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
    console.log(`Headshot ${headshotId} completed for user ${userId}`);
  } catch (error) {
    console.error(`Error generating headshot ${headshotId}:`, error instanceof Error ? error.message : 'Unknown error');
    await updateHeadshot(headshotId, { status: 'failed' });
    throw error; // Re-throw to ensure the timeout catch block triggers
  }
}