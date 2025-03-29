import { neon } from '@neondatabase/serverless';
import { db } from './db';
import { stackServerApp } from '../app/api/_stack';

// Check for NEON_DATABASE_URL, but don't throw an error during build time
const neonDatabaseUrl = process.env.NEON_DATABASE_URL || '';

// Initialize Neon client conditionally
export const neonClient = neonDatabaseUrl ? neon(neonDatabaseUrl) : null;

// Auth helper functions
export const auth = {
  getSession: async () => {
    try {
      const user = await stackServerApp.getUser();
      return {
        data: { 
          session: {
            user: user || null
          } 
        },
        error: null
      };
    } catch (error) {
      console.error('Error getting user session:', error);
      return {
        data: { session: { user: null } },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Create admin interface
export const supabaseAdmin = {
  auth: auth,
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: string | number) => {
        if (!neonDatabaseUrl) {
          console.error('NEON_DATABASE_URL environment variable is not set');
          return { rows: [] };
        }
        return db.query(`SELECT ${columns} FROM ${table} WHERE ${column} = $1`, [value]);
      }
    }),
    insert: (data: Record<string, unknown>) => {
      if (!neonDatabaseUrl) {
        console.error('NEON_DATABASE_URL environment variable is not set');
        return { rows: [] };
      }
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