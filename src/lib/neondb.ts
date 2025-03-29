import { neon } from '@neondatabase/serverless';
import { db } from './db';
import { stackServerApp } from '../app/api/_stack';

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL environment variable is not set');
}

// Initialize Neon client
export const neonClient = neon(process.env.NEON_DATABASE_URL);

// Auth helper functions
export const auth = {
  getSession: async () => {
    const user = await stackServerApp.getUser();
    return {
      data: { 
        session: {
          user: user || null
        } 
      },
      error: null
    };
  }
};

// Create admin interface
export const supabaseAdmin = {
  auth: auth,
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