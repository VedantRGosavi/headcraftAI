// types/user.ts
export interface User {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  }
  
  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: Error | null;
  }
  
  export interface AuthFormData {
    email: string;
    password: string;
    fullName?: string;
  }