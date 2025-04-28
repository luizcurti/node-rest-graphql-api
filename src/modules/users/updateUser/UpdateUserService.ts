import { User } from '@models/User';

interface UpdateUserDTO {
  id: string;
  name?: string;
  username?: string;
}

class UpdateUserService {
  async execute({ id, name, username }: UpdateUserDTO) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    let isUpdated = false;

    if (name) {
      user.name = name;
      isUpdated = true;
    }
    if (username) {
      user.username = username;
      isUpdated = true;
    }

    if (isUpdated) {
      await user.save();
    }

    return user;
  }
}

export { UpdateUserService };
