// pages/api/upload/upload.ts
import { NextRequest, NextResponse } from 'next/server';
import { stackClient } from '../../../lib/stack-client';
import { uploadImage } from '../../../lib/images';
import fs from 'fs';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function POST(req: NextRequest) {
  try {
    const user = await stackClient.getUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return createErrorResponse('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Invalid file type. Only JPEG, PNG, and HEIC files are allowed.');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return createErrorResponse('File size too large. Maximum size is 10MB.');
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temporary file
    const tempPath = `/tmp/${file.name}`;
    fs.writeFileSync(tempPath, buffer);

    try {
      // Upload the file
      const uploadedImage = await uploadImage({
        file: tempPath,
        userId: user.id
      });
      return NextResponse.json(uploadedImage);
    } finally {
      // Clean up temporary file
      fs.unlinkSync(tempPath);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return createErrorResponse('Failed to upload file', 500);
  }
}