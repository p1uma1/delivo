import { userRepository, UserWithoutPassword } from '../repositories/user.repository';
import { NotFoundError, ValidationError } from '@delivo/shared';

interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

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

    return userRepository.update(userId, {
      name: input.name,
      phone: input.phone,
    });
  }

  async listRiders(): Promise<UserWithoutPassword[]> {
    return userRepository.findAllRiders();
  }
}

export const userService = new UserService();
