import { neon } from '@neondatabase/serverless';
import { db } from './db';

// Check if we're in a build environment or missing database URL
const isBuildTime = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL_ENV;
const mockDatabase = isBuildTime || !process.env.NEON_DATABASE_URL;

// Initialize Neon client
export const neonClient = mockDatabase 
  ? ((text: string, params?: unknown[]) => { console.log(`Mock neonClient query: ${text}`, params); return []; }) 
  : neon(process.env.NEON_DATABASE_URL!);

// Auth helper functions to replace Supabase auth
export const auth = {
  getSession: async () => {
    // This would typically come from a session cookie or token
    // For now, return a placeholder that will be replaced with actual auth
    return {
      data: { 
        session: {
          user: { 
            id: '' 
          }
        } 
      },
      error: null
    };
  }
};

// Create admin interface that's similar to what was expected from Supabase
export const supabaseAdmin = {
  auth: auth,
  // Add any other required methods
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string | number) => {
        return db.query(`SELECT ${columns} FROM ${table} WHERE ${column} = $1`, [value]);
      }
    }),
    insert: (data: Record<string, unknown>) => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(data);
      
      return db.query(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
    }
  })
}; 