// lib/auth.ts
import { db } from './db';
import { AuthFormData, User } from '../types/user';

/**
 * Sign up a new user
 * @param formData User's sign-up information
 * @returns The newly created user
 */
export async function signUp(formData: AuthFormData): Promise<User> {
  const { email, password, fullName } = formData;

  try {
    // Insert the user into the database
    const result = await db.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *',
      [email, password, fullName || '']
    );

    return result.rows[0] as User;
  } catch (error) {
    console.error('Error signing up:', error);
    throw new Error('Failed to sign up');
  }
}

/**
 * Sign in an existing user
 * @param formData User's sign-in information
 * @returns The signed-in user
 */
export async function signIn(formData: AuthFormData): Promise<User> {
  const { email, password } = formData;

  try {
    // Find the user by email and validate password
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    return result.rows[0] as User;
  } catch (error) {
    console.error('Error signing in:', error);
    throw new Error('Failed to sign in');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  // With Neon DB, we don't need to do anything for sign out
  // since we're not maintaining session state on the server
  return;
}

/**
 * Get the current user's session
 * @returns The current user or null if not signed in
 */
export async function getCurrentSession(): Promise<User | null> {
  try {
    const { stackServerApp } = await import('../stack');
    const user = await stackServerApp.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Reset the user's password
 * @param email The user's email
 * @returns Success status
 */
export async function resetPassword(email: string): Promise<boolean> {
  try {
    // We would typically send a password reset email here
    // For now, just verify the user exists
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error('Failed to reset password');
  }
}

/**
 * Update the user's password
 * @param password The new password
 * @returns Success status
 */
export async function updatePassword(password: string): Promise<boolean> {
  try {
    // This would typically update the user's password in the database
    // based on the current user's ID
    // For now, just log that we would update the password
    console.log(`Would update password to: ${password}`);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Failed to update password');
  }
}

/**
 * Update the user's profile
 * @param profile The updated profile information
 * @returns The updated user
 */
export async function updateProfile(profile: { fullName?: string; avatarUrl?: string }): Promise<User> {
  try {
    // This would typically update the user's profile in the database
    // Log what we would update for debugging
    console.log('Profile update:', profile);
    
    // Return a placeholder user
    return { id: '1', email: 'user@example.com' } as User;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
}