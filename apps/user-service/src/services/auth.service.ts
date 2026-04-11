import bcrypt from 'bcryptjs';
import { userRepository, UserWithoutPassword } from '../repositories/user.repository';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  publishEvent,
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from '@delivo/shared';

const SALT_ROUNDS = 12;

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'admin' | 'rider' | 'customer';
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserWithoutPassword;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthTokens> {
    const { email, password, name, phone, role = 'customer' } = input;

    // Check for existing user
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
    });

    // Publish event for other services
    await publishEvent('user.created', {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const tokens = await this._issueTokens(user.id, user.email, user.role);
    return { ...tokens, user };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const { email, password } = input;

    const userRecord = await userRepository.findByEmail(email);
    if (!userRecord) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!userRecord.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const passwordMatch = await bcrypt.compare(password, userRecord.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Revoke old refresh tokens (single active session per user for MVP)
    await userRepository.deleteAllRefreshTokensForUser(userRecord.id);

    const { password: _p, ...user } = userRecord;
    const tokens = await this._issueTokens(user.id, user.email, user.role);
    return { ...tokens, user };
  }

  async refreshTokens(oldRefreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(oldRefreshToken);

    const stored = await userRepository.findRefreshToken(oldRefreshToken);
    if (!stored) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }
    if (new Date() > stored.expiresAt) {
      await userRepository.deleteRefreshToken(oldRefreshToken);
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Rotate: delete old, issue new
    await userRepository.deleteRefreshToken(oldRefreshToken);

    const userRecord = await userRepository.findById(payload.userId);
    if (!userRecord || !userRecord.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    const { password: _p, ...user } = userRecord;
    const tokens = await this._issueTokens(user.id, user.email, user.role);
    return { ...tokens, user };
  }

  async logout(refreshToken: string): Promise<void> {
    await userRepository.deleteRefreshToken(refreshToken);
  }

  private async _issueTokens(
    userId: string,
    email: string,
    role: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = signAccessToken({ userId, email, role });
    const refreshToken = signRefreshToken({ userId });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await userRepository.createRefreshToken(userId, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
