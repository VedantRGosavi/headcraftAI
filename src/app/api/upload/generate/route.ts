import { NextResponse } from 'next/server';
import { stackServerApp } from '../../../../stack';
import { analyzeImages, generateHeadshotPrompt, generateHeadshot } from '../../../../lib/openai';
import { createHeadshot, storeGeneratedImage, updateHeadshot, getUserUploadedImages } from '../../../../lib/images';
import { createCheckoutSession } from '../../../../lib/stripe';
import { GenerationPreference } from '../../../../types/image';

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_BASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`${envVar} environment variable is not set`);
  }
}

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
    let uploadedImages;
    try {
      uploadedImages = await getUserUploadedImages(userId);
    } catch (error) {
      console.error('Error fetching user images:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user images. Please try again later.' },
        { status: 500 }
      );
    }

    const selectedImages = uploadedImages.filter((img) => imageIds.includes(img.id));

    if (selectedImages.length !== imageIds.length) {
      return NextResponse.json(
        { error: 'One or more image IDs are invalid or unauthorized' },
        { status: 400 }
      );
    }

    // Create a headshot record
    let headshot;
    try {
      headshot = await createHeadshot(userId);
    } catch (error) {
      console.error('Error creating headshot record:', error);
      return NextResponse.json(
        { error: 'Failed to create headshot record. Please try again later.' },
        { status: 500 }
      );
    }

    const imageUrls = selectedImages.map((img) => img.url);

    // Start the generation process in the background with a timeout
    const generationPromise = generateHeadshotProcess(userId, headshot.id, imageUrls, preferences);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Headshot generation timed out')), 60000) // 60-second timeout
    );

    // Handle the background process
    Promise.race([generationPromise, timeoutPromise]).catch(async (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Background headshot generation failed:', errorMessage);
      
      try {
        await updateHeadshot(headshot.id, { 
          status: 'failed',
          prompt: `Generation failed: ${errorMessage}` // Store error message for debugging
        });
      } catch (updateError) {
        console.error('Failed to update headshot status:', updateError);
      }
    });

    // Create a checkout session for payment
    let checkoutUrl;
    try {
      checkoutUrl = await createCheckoutSession(userId, headshot.id);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Update headshot status to failed
      try {
        await updateHeadshot(headshot.id, { status: 'failed' });
      } catch (updateError) {
        console.error('Failed to update headshot status:', updateError);
      }
      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Error initiating headshot generation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Determine appropriate status code based on error
    let status = 500;
    if (errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
      status = 401;
    } else if (errorMessage.includes('invalid') || errorMessage.includes('missing')) {
      status = 400;
    }

    return NextResponse.json(
      { error: `Failed to initiate headshot generation: ${errorMessage}` },
      { status }
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
    let baseDescription;
    try {
      baseDescription = await analyzeImages(imageUrls);
    } catch (error) {
      console.error('Error analyzing images:', error);
      throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate final prompt incorporating user preferences
    let prompt;
    try {
      prompt = await generateHeadshotPrompt(baseDescription, preferences);
    } catch (error) {
      console.error('Error generating prompt:', error);
      throw new Error(`Prompt generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate the headshot using DALL-E 3
    let generatedImageUrl;
    try {
      generatedImageUrl = await generateHeadshot(prompt);
    } catch (error) {
      console.error('Error generating headshot:', error);
      throw new Error(`Headshot generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Store the generated image
    try {
      await storeGeneratedImage(headshotId, generatedImageUrl);
    } catch (error) {
      console.error('Error storing generated image:', error);
      throw new Error(`Failed to store generated image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Update status to completed
    await updateHeadshot(headshotId, { status: 'completed' });
    console.log(`Headshot ${headshotId} completed for user ${userId}`);
  } catch (error) {
    console.error(`Error generating headshot ${headshotId}:`, error);
    await updateHeadshot(headshotId, { 
      status: 'failed',
      prompt: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error; // Re-throw to ensure the timeout catch block triggers
  }
}