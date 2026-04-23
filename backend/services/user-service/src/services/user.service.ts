import { userRepository } from '../repositories/user.repository';
import { UserWithoutPassword, UpdateProfileInput } from '../types/user.types';
import { NotFoundError, ValidationError } from '@delivo/shared';

export class UserService {
  async getProfile(userId: string): Promise<UserWithoutPassword> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    const { password: _p, ...rest } = user;
    return rest;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserWithoutPassword> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError('Name cannot be empty');
    }

    return userRepository.update(userId, { name: input.name });
  }

  async completeSetup(userId: string, role: string): Promise<UserWithoutPassword> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.role !== 'unassigned') {
      throw new ValidationError('User setup is already complete');
    }

    if (!['rider', 'customer', 'merchant'].includes(role)) {
      throw new ValidationError('Invalid role selected');
    }

    // Notice: not updating role_data since DB migration was blocked by user
    return userRepository.update(userId, { role: role as any });
  }

  async listRiders(): Promise<UserWithoutPassword[]> {
    return userRepository.findAllRiders();
  }
}

export const userService = new UserService();
