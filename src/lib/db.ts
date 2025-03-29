import { neon } from '@neondatabase/serverless';

// Check for database URLs in order of preference
const getDatabaseUrl = () => {
  // First check for NEON_DATABASE_URL
  if (process.env.NEON_DATABASE_URL) {
    return process.env.NEON_DATABASE_URL;
  }
  
  // Fallback to DATABASE_URL if NEON_DATABASE_URL is not available
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Log a warning in development, but don't throw an error
  if (process.env.NODE_ENV !== 'production') {
    console.warn('No database URL found. Using mock data.');
  }
  
  return '';
};

// Initialize the neon client conditionally
const neonDatabaseUrl = getDatabaseUrl();
const sql = neonDatabaseUrl ? neon(neonDatabaseUrl) : null;

// For debugging in development only
if (process.env.NODE_ENV !== 'production' && !sql) {
  console.warn('Database connection not initialized - using mock data');
}

export const db = {
  query: async (text: string, params?: unknown[]) => {
    try {
      if (!sql) {
        console.error('Database connection not initialized - missing database URL');
        return { rows: [], rowCount: 0 };
      }
      const result = await sql(text, params);
      return { rows: result, rowCount: result.length };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  // Simplified transaction helper that doesn't rely on passing sql to callback
  transaction: async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
      if (!sql) {
        console.error('Database connection not initialized - missing database URL');
        throw new Error('Database connection not initialized');
      }
      await sql('BEGIN');
      const result = await callback();
      await sql('COMMIT');
      return result;
    } catch (error) {
      if (sql) {
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