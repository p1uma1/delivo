// ─── Core User Entity ─────────────────────────────────────────────────────────
// Update this interface to match your database schema changes

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export type UserRole = 'admin' | 'rider' | 'customer';

export type UserWithoutPassword = Omit<User, 'password'>;

// ─── Refresh Token Entity ─────────────────────────────────────────────────────

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserWithoutPassword;
}

export interface UpdateProfileInput {
  name?: string;
}
