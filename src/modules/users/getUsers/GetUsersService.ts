import { User } from '@models/User';

class GetUsersService {
  async execute() {
    const users = await User.find();
    return users;
  }
}

export { GetUsersService };
