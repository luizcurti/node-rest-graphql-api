import { User } from '@models/User';

class GetUserByIdService {
  async execute(id: string) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export { GetUserByIdService };
