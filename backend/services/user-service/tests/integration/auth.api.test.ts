import request from 'supertest';
import app from '../../src/index';
import { userRepository } from '../../src/repositories/user.repository';
import bcrypt from 'bcryptjs';

// Mock the repository and bcrypt
jest.mock('../../src/repositories/user.repository');
jest.mock('bcryptjs');

describe('Auth API', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'customer',
    isActive: true,
    createdAt: new Date(),
  };

  describe('POST /auth/register', () => {
    it('should return 201 on successful registration', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        name: 'New User',
        role: 'customer',
        isActive: true,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('new@example.com');
      expect(response.header['set-cookie']).toBeDefined(); // Refresh token cookie
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'new@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 on successful login', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userRepository.deleteAllRefreshTokensForUser as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });
  });
});
