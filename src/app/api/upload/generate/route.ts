import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '../../_stack';
import { getUserUploadedImages } from '../../../../lib/images';
import { generateHeadshots } from '../../../../lib/generation';
import { GenerationPreference } from '../../../../types/image';

function createErrorResponse(message: string, status = 400) {
  return new Response(message, { status });
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const preferences = body.preferences as GenerationPreference;

    if (!preferences) {
      return createErrorResponse('Generation preferences are required');
    }

    // Get the user's uploaded images
    const uploadedImages = await getUserUploadedImages();
    if (!uploadedImages || uploadedImages.length === 0) {
      return createErrorResponse('No images found for generation');
    }

    // Generate headshots
    const result = await generateHeadshots(uploadedImages, preferences);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating headshots:', error);
    return createErrorResponse(
      'Failed to generate headshots: ' + (error instanceof Error ? error.message : 'Unknown error'),
      500
    );
  }
}