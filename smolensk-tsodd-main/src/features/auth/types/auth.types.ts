export type UserRole = 'guest' | 'editor' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
