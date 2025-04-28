import { User } from '@models/User';

class GetUsersService {
  async execute() {
    const users = await User.find();
    if (!users) {
      throw new Error('Users not found');
    }

    return users;
  }
}

export { GetUsersService };
