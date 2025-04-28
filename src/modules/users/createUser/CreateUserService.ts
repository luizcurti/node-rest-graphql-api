import { User } from '@models/User';

interface ICreateUserDTO {
  name: string;
  username: string;
}

class CreateUserService {
  async execute({ name, username }: ICreateUserDTO) {
    const userAlreadyExists = await User.findOne({ username });

    if (userAlreadyExists) {
      throw new Error('User already exists!');
    }

    const user = await User.create({
      name,
      username,
    });

    return user;
  }
}

export { CreateUserService };
