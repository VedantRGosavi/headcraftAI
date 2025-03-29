import { NextRequest, NextResponse } from 'next/server';
import { stackClient } from '../../../lib/stack-client';
import { getUserUploadedImages, getUserHeadshots } from '../../../lib/images';

function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await stackClient.getUser();
    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const type = req.nextUrl.searchParams.get('type');
    if (!type) {
      return createErrorResponse('Image type not specified');
    }

    let images;
    if (type === 'uploaded') {
      images = await getUserUploadedImages();
    } else if (type === 'headshots') {
      images = await getUserHeadshots();
    } else {
      return createErrorResponse('Invalid image type');
    }

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return createErrorResponse('Failed to fetch images', 500);
  }
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

    // Process the file upload
    // This is where you would handle the actual file upload to your storage service
    // For now, we'll just return a success message
    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return createErrorResponse('Failed to upload file', 500);
  }
} 