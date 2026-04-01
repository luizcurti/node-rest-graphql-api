import { User } from '@models/User';

class DeleteUserService {
  async execute(id: string) {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new Error('User not found');
    }
  }
}

export { DeleteUserService };
