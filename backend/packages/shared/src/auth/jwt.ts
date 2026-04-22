import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

export function signAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');

  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) || '15m',
  };

  return jwt.sign(payload, secret, options);
}

export function signRefreshToken(payload: Pick<TokenPayload, 'userId'>): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set');

  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
  };

  return jwt.sign(payload, secret, options);
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): TokenPayload & JwtPayload {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set');

  try {
    return jwt.verify(token, secret) as TokenPayload & JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): { userId: string } & JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set');

  try {
    return jwt.verify(token, secret) as { userId: string } & JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
