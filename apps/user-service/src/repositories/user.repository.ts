import { User, RefreshToken, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export type UserWithoutPassword = Omit<User, 'password'>;

export class UserRepository {
  // ─── User CRUD ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserWithoutPassword> {
    const user = await prisma.user.create({ data });
    const { password: _password, ...rest } = user;
    return rest;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword> {
    const user = await prisma.user.update({ where: { id }, data });
    const { password: _password, ...rest } = user;
    return rest;
  }

  async findAllRiders(): Promise<UserWithoutPassword[]> {
    const users = await prisma.user.findMany({
      where: { role: 'rider', isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ password: _p, ...rest }) => rest);
  }

  // ─── Refresh Token CRUD ──────────────────────────────────────────────────────

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}

export const userRepository = new UserRepository();
