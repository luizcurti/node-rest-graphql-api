import { CreateUserService } from '@modules/users/createUser/CreateUserService';
import { GetUsersService } from '@modules/users/getUsers/GetUsersService';
import { GetUserByIdService } from '@modules/users/getUserById/GetUserByIdService';
import { UpdateUserService } from '@modules/users/updateUser/UpdateUserService';
import { DeleteUserService } from '@modules/users/deleteUser/DeleteUserService';

const usersResolvers = {
  Mutation: {
    async createUser(_, { input }) {
      try {
        const { name, username } = input;

        if (!name || !username) {
          throw new Error('Validation failed: Missing required fields.');
        }

        const createUserService = new CreateUserService();
        const user = await createUserService.execute({ name, username });

        return user;
      } catch (error) {
        if (error.message === 'User already exists!') {
          throw new Error('User already exists!');
        }
        throw new Error(error.message || 'Internal server error');
      }
    },

    async updateUser(_, { id, input }) {
      try {
        const { name, username } = input;

        if (!id || (!name && !username)) {
          throw new Error('Validation failed: Missing required fields.');
        }

        const updateUserService = new UpdateUserService();
        const updatedUser = await updateUserService.execute({ id, name, username });

        return updatedUser;
      } catch (error) {
        if (error.message === 'User not found') {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Internal server error');
      }
    },

    async deleteUser(_, { id }) {
      try {
        if (!id) {
          throw new Error('Validation failed: Missing user ID.');
        }

        const deleteUserService = new DeleteUserService();
        await deleteUserService.execute(id);

        return true;
      } catch (error) {
        if (error.message === 'User not found') {
          throw new Error('User not found');
        }
        throw new Error(error.message || 'Internal server error');
      }
    },
  },

  Query: {
    async getAllUsers() {
      try {
        const getUsersService = new GetUsersService();
        const users = await getUsersService.execute();

        if (!users || users.length === 0) {
          throw new Error('Users not found');
        }

        return users;
      } catch (error) {
        throw new Error(error.message || 'Internal server error');
      }
    },

    async getUserById(_, { id }) {
      try {
        if (!id) {
          throw new Error('Validation failed: Missing user ID.');
        }

        const getUserByIdService = new GetUserByIdService();
        const user = await getUserByIdService.execute(id);

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      } catch (error) {
        throw new Error(error.message || 'Internal server error');
      }
    },
  },
};

export default usersResolvers;
