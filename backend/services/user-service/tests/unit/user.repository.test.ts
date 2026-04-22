import { userRepository } from '../../src/repositories/user.repository';
import * as db from '../../src/lib/db';

// Mock the query function from db.ts
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('UserRepository', () => {
  const mockUserRow = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'customer',
    is_active: true,
    created_at: new Date(),
  };

  describe('findById', () => {
    it('should return a user if found', async () => {
      (db.query as jest.Mock).mockResolvedValue({
        rows: [mockUserRow],
      });

      const user = await userRepository.findById('user-1');

      expect(user).not.toBeNull();
      expect(user?.email).toBe(mockUserRow.email);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE id = $1'),
        ['user-1']
      );
    });

    it('should return null if user not found', async () => {
      (db.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const user = await userRepository.findById('non-existent');

      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should successfully insert a new user and return it', async () => {
      (db.query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockUserRow,
          is_active: true,
          created_at: new Date()
        }],
      });

      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'customer',
      };

      const result = await userRepository.create(userData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [userData.email, userData.password, userData.name, userData.role]
      );
    });
  });
});
