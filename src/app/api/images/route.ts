import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Image, HeadshotWithImages } from '@/types/image';
import { getCurrentSession } from '@/lib/auth';

const dbUrl = process.env.NEON_DATABASE_URL;
if (!dbUrl) {
  throw new Error('NEON_DATABASE_URL environment variable is not set');
}

const db = neon(dbUrl);

// Helper function to execute SQL queries
async function executeQuery<T>(query: string, params: unknown[] = []): Promise<T[]> {
  try {
    const result = await db(query, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = session.id;

    switch (action) {
      case 'getUserHeadshots': {
        const headshots = await executeQuery<HeadshotWithImages>(
          `SELECT h.*, 
            gi.id as "generated_image.id", 
            gi.url as "generated_image.url", 
            gi.type as "generated_image.type", 
            gi.created_at as "generated_image.created_at", 
            gi.user_id as "generated_image.user_id",
            ARRAY_AGG(json_build_object(
              'id', ui.id,
              'url', ui.url,
              'type', ui.type,
              'created_at', ui.created_at,
              'user_id', ui.user_id
            )) as uploaded_images
          FROM headshots h
          LEFT JOIN images gi ON h.generated_image_id = gi.id
          LEFT JOIN headshot_images hi ON h.id = hi.headshot_id
          LEFT JOIN images ui ON hi.image_id = ui.id
          WHERE h.user_id = $1
          GROUP BY h.id, gi.id
          ORDER BY h.created_at DESC`,
          [userId]
        );
        return NextResponse.json(headshots);
      }

      case 'getUserUploadedImages': {
        const images = await executeQuery<Image>(
          'SELECT * FROM images WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC',
          [userId, 'uploaded']
        );
        return NextResponse.json(images);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;
    const userId = session.id;

    switch (action) {
      case 'createHeadshot': {
        const result = await executeQuery<HeadshotWithImages>(
          'INSERT INTO headshots (user_id, status) VALUES ($1, $2) RETURNING *',
          [userId, 'pending']
        );
        return NextResponse.json(result[0]);
      }

      case 'updateHeadshot': {
        const { headshotId, updates } = data;
        const setClause = Object.entries(updates)
          .map(([key], index) => `${key} = $${index + 2}`)
          .join(', ');
        const values = [headshotId, ...Object.values(updates)];

        const result = await executeQuery<HeadshotWithImages>(
          `UPDATE headshots SET ${setClause}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
          [...values, userId]
        );
        return NextResponse.json(result[0]);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 