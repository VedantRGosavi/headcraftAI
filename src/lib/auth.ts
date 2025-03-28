// lib/auth.ts
import { supabaseClient } from './supabase';
import { AuthFormData, User } from '../types/user';

/**
 * Sign up a new user
 * @param formData User's sign-up information
 * @returns The newly created user
 */
export async function signUp(formData: AuthFormData): Promise<User> {
  const { email, password, fullName } = formData;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  });

  if (error) {
    console.error('Error signing up:', error);
    throw new Error(error.message);
  }

  return data?.user as User;
}

/**
 * Sign in an existing user
 * @param formData User's sign-in information
 * @returns The signed-in user
 */
export async function signIn(formData: AuthFormData): Promise<User> {
  const { email, password } = formData;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    throw new Error(error.message);
  }

  return data?.user as User;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw new Error(error.message);
  }
}

/**
 * Get the current user's session
 * @returns The current user or null if not signed in
 */
export async function getCurrentSession(): Promise<User | null> {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return data?.session?.user as User || null;
}

/**
 * Reset the user's password
 * @param email The user's email
 * @returns Success status
 */
export async function resetPassword(email: string): Promise<boolean> {
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  });

  if (error) {
    console.error('Error resetting password:', error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Update the user's password
 * @param password The new password
 * @returns Success status
 */
export async function updatePassword(password: string): Promise<boolean> {
  const { error } = await supabaseClient.auth.updateUser({
    password,
  });

  if (error) {
    console.error('Error updating password:', error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Update the user's profile
 * @param profile The updated profile information
 * @returns The updated user
 */
export async function updateProfile(profile: { fullName?: string; avatarUrl?: string }): Promise<User> {
  const { fullName, avatarUrl } = profile;

  const { data, error } = await supabaseClient.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  });

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message);
  }

  return data?.user as User;
}