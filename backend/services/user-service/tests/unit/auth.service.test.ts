import { authService } from '../../src/services/auth.service';
import { userRepository } from '../../src/repositories/user.repository';
import bcrypt from 'bcryptjs';

// Mock the repository and shared functions
jest.mock('../../src/repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('@delivo/shared', () => ({
  ...jest.requireActual('@delivo/shared'),
  signAccessToken: jest.fn(() => 'mockAccessToken'),
  signRefreshToken: jest.fn(() => 'mockRefreshToken'),
  verifyRefreshToken: jest.fn(() => ({ userId: 'user-123' })),
  publishEvent: jest.fn(),
}));

describe('AuthService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'customer' as const,
    isActive: true,
    createdAt: new Date(),
  };

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const input = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: input.email,
        name: input.name,
        role: 'customer',
        isActive: true,
        createdAt: new Date(),
      });

      const result = await authService.register(input);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(input.email);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if email exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Existing User',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userRepository.deleteAllRefreshTokensForUser as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
