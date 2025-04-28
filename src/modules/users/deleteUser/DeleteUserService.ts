import { User } from '@models/User';

class DeleteUserService {
  async execute(id: string) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    await User.findByIdAndDelete(id);
  }
}

export { DeleteUserService };
