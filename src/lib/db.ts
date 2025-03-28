import { neon } from '@neondatabase/serverless';

// Check if we're in a build environment or missing database URL
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL_ENV;
const mockDatabase = isBuildTime || !process.env.NEON_DATABASE_URL;

// If running in build time or missing DB URL, create a mock client
let sql;
if (mockDatabase) {
  console.log('Using mock database client for build/development');
  // Mock client that returns empty arrays
  sql = (text: string, params?: unknown[]) => {
    console.log(`Mock DB query: ${text}`, params);
    return [];
  };
} else {
  // Real client
  sql = neon(process.env.NEON_DATABASE_URL!);
}

// Define the type for our neon query function
type SqlQueryFunction = typeof sql;

export const db = {
  query: async (text: string, params?: unknown[]) => {
    try {
      if (mockDatabase) {
        return { rows: [], rowCount: 0 };
      }
      const result = await sql(text, params);
      return { rows: result, rowCount: result.length };
    } catch (error) {
      console.error('Database query error:', error);
      if (mockDatabase) {
        return { rows: [], rowCount: 0 };
      }
      throw error;
    }
  },
  
  // Add a transaction helper
  transaction: async <T>(callback: (client: SqlQueryFunction) => Promise<T>): Promise<T> => {
    try {
      if (mockDatabase) {
        return await callback(sql as SqlQueryFunction);
      }
      await sql('BEGIN');
      const result = await callback(sql);
      await sql('COMMIT');
      return result;
    } catch (error) {
      if (!mockDatabase) {
        await sql('ROLLBACK');
      }
      throw error;
    }
  }
};

// Helper functions for common queries
export const dbHelpers = {
  // User related queries
  getUserById: async (userId: string) => {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return rows[0];
  },

  // Upload related queries
  createUpload: async (userId: string, filePath: string) => {
    const { rows } = await db.query(
      'INSERT INTO uploads (user_id, file_path, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, filePath, 'pending']
    );
    return rows[0];
  },

  // Headshot related queries
  createHeadshot: async (uploadId: string, userId: string) => {
    const { rows } = await db.query(
      'INSERT INTO generated_headshots (upload_id, user_id, file_path, style) VALUES ($1, $2, $3, $4) RETURNING *',
      [uploadId, userId, '', '']
    );
    return rows[0];
  },

  getUserHeadshots: async (userId: string) => {
    const { rows } = await db.query(
      `SELECT gh.*, u.file_path as original_image_path 
       FROM generated_headshots gh 
       JOIN uploads u ON gh.upload_id = u.id 
       WHERE gh.user_id = $1 
       ORDER BY gh.created_at DESC`,
      [userId]
    );
    return rows;
  }
}; 