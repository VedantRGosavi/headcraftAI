// types/user.ts
import { CurrentUser } from '@stackframe/stack';

export type User = CurrentUser;

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