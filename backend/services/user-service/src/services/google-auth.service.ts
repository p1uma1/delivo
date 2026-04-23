import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { userRepository } from '../repositories/user.repository';
import {
  GoogleAuthInput,
  AuthTokens,
  UserRole,
  UserWithoutPassword,
} from '../types/user.types';
import {
  signAccessToken,
  signRefreshToken,
  UnauthorizedError,
  ValidationError,
} from '@delivo/shared';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService {
  // ─── Verify & Login / Register ────────────────────────────────────────────────

  async loginWithGoogle(input: GoogleAuthInput): Promise<AuthTokens> {
    const { idToken, role = 'customer' } = input;

    // 1. Verify the ID token with Google
    const payload = await this._verifyIdToken(idToken);
    const { sub: googleId, email, name } = payload;

    if (!email) {
      throw new ValidationError('Google account must have an email address');
    }

    // 2a. Find by google_id (returning user)
    let userRecord = await userRepository.findByGoogleId(googleId);

    if (userRecord) {
      // Returning Google-linked user — just issue tokens
      if (!userRecord.isActive) {
        throw new UnauthorizedError('Account is deactivated');
      }
    } else {
      // 2b. Maybe the email already exists from password sign-up → link accounts
      const existingByEmail = await userRepository.findByEmail(email);

      if (existingByEmail) {
        // Link the Google ID to the existing account
        await userRepository.linkGoogleId(existingByEmail.id, googleId);
        userRecord = { ...existingByEmail, googleId };
      } else {
        // 2c. Brand new user — create with the requested role
        const created = await userRepository.create({
          email,
          name: name ?? undefined,
          role: 'unassigned',
          googleId,
          // no password — OAuth user
        });
        userRecord = await userRepository.findById(created.id) as NonNullable<typeof userRecord>;
      }
    }

    const { password: _p, ...user } = userRecord!;
    const tokens = await this._issueTokens(user.id, user.email, user.role);
    return { ...tokens, user };
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private async _verifyIdToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Empty token payload');
      return payload;
    } catch {
      throw new UnauthorizedError('Invalid Google ID token');
    }
  }

  private async _issueTokens(
    userId: string,
    email: string,
    role: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = signAccessToken({ userId, email, role });
    const refreshToken = signRefreshToken({ userId });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await userRepository.createRefreshToken(userId, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  }
}

export const googleAuthService = new GoogleAuthService();
