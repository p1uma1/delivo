export interface User {
  id: string;
  email: string;
  password?: string;       // ← back to optional (no password for OAuth users)
  name?: string;
  googleId?: string;       // ← NEW
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

// what client sends to /auth/google
export interface GoogleAuthInput {
  idToken: string;
  role?: UserRole;
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
