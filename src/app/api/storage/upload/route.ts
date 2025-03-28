import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '../../../../stack';
import { put } from '@vercel/blob';

// Helper to create error response
function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { 
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await stackServerApp.getUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
      return createErrorResponse('File and path are required');
    }

    // Validate file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse('File size exceeds the 10MB limit');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Invalid file type. Only JPEG, PNG, and HEIC images are allowed');
    }

    try {
      // Ensure path starts with the correct prefix
      const safePath = path.startsWith('/') ? path.slice(1) : path;
      
      // Upload to Vercel Blob
      const blob = await put(safePath, file, {
        access: 'public',
        contentType: file.type,
        addRandomSuffix: true
      });

      return NextResponse.json(
        { url: blob.url },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    } catch (uploadError) {
      console.error('Blob storage upload error:', uploadError);
      return createErrorResponse(
        'Failed to upload file to storage: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error'),
        500
      );
    }
  } catch (error) {
    console.error('Error handling upload request:', error);
    return createErrorResponse(
      'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      500
    );
  }
} 