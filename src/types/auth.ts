
export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
