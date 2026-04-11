// Mock types since Prisma is removed
export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  role: 'admin' | 'rider' | 'customer';
  isActive: boolean;
  createdAt: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;

// In-memory stores
const users: User[] = [
  {
    id: 'admin-1',
    email: 'admin@delivo.com',
    password: '$2a$10$YourHashedPasswordStub', // In real world, bcrypt hash of 'password123'
    name: 'Main Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
  }
];
const refreshTokens: RefreshToken[] = [];

export class UserRepository {
  // ─── User CRUD ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email) || null;
  }

  async create(data: any): Promise<UserWithoutPassword> {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      ...data,
      isActive: true,
      createdAt: new Date(),
    };
    users.push(newUser);
    const { password: _password, ...rest } = newUser;
    return rest;
  }

  async update(id: string, data: any): Promise<UserWithoutPassword> {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    users[index] = { ...users[index], ...data };
    const { password: _password, ...rest } = users[index];
    return rest;
  }

  async findAllRiders(): Promise<UserWithoutPassword[]> {
    return users
      .filter(u => u.role === 'rider' && u.isActive)
      .map(({ password: _p, ...rest }) => rest);
  }

  // ─── Refresh Token CRUD ──────────────────────────────────────────────────────

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const newToken: RefreshToken = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    refreshTokens.push(newToken);
    return newToken;
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return refreshTokens.find(t => t.token === token) || null;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    const index = refreshTokens.findIndex(t => t.token === token);
    if (index !== -1) refreshTokens.splice(index, 1);
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    let i = refreshTokens.length;
    while (i--) {
      if (refreshTokens[i].userId === userId) {
        refreshTokens.splice(i, 1);
      }
    }
  }
}

export const userRepository = new UserRepository();
