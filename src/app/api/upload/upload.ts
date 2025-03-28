// pages/api/upload/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabaseAdmin } from '../../../lib/supabase';
import { uploadImage } from '../../../lib/images';
import fs from 'fs';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

type FormidableFile = {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
};

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
    // Parse form data
    const form = formidable({ multiples: true });
    
    const parseForm = (): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
          }
          resolve({ fields, files });
        });
      });
    };

    const { files } = await parseForm();
    const uploadedImages = [];

    // Handle multiple file uploads
    const uploadFiles = Array.isArray(files.file) ? files.file : [files.file];

    for (const file of uploadFiles) {
      if (!file) continue;
      
      // Create a File object from the uploaded file
      const content = await fs.promises.readFile(file.filepath);
      const fileObj = new File([content], file.originalFilename || 'upload.jpg', {
        type: file.mimetype || 'image/jpeg',
      });

      // Upload to Supabase
      const image = await uploadImage(fileObj, userId);
      uploadedImages.push(image);

      // Clean up the temp file
      await fs.promises.unlink(file.filepath);
    }

    return res.status(200).json({ images: uploadedImages });
  } catch (error) {
    console.error('Error in upload API:', error);
    return res.status(500).json({ error: 'Failed to upload images' });
  }
}