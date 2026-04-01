import { CreateUserService } from '@modules/users/createUser/CreateUserService';
import { UpdateUserService } from '@modules/users/updateUser/UpdateUserService';
import { DeleteUserService } from '@modules/users/deleteUser/DeleteUserService';
import { GetUsersService } from '@modules/users/getUsers/GetUsersService';
import { GetUserByIdService } from '@modules/users/getUserById/GetUserByIdService';
import usersResolvers from '../users.resolvers';

jest.mock('@modules/users/createUser/CreateUserService');
jest.mock('@modules/users/updateUser/UpdateUserService');
jest.mock('@modules/users/deleteUser/DeleteUserService');
jest.mock('@modules/users/getUsers/GetUsersService');
jest.mock('@modules/users/getUserById/GetUserByIdService');

describe('User Resolvers', () => {
  describe('createUser Resolver', () => {
    it('should create a new user', async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        _id: '123',
        name: 'John Doe',
        username: 'johndoe',
        createdAt: new Date(),
      });

      CreateUserService.prototype.execute = mockExecute;

      const response = await usersResolvers.Mutation.createUser(
        null,
        { input: { name: 'John Doe', username: 'johndoe' } },
      );

      expect(response).toEqual({
        _id: '123',
        name: 'John Doe',
        username: 'johndoe',
        createdAt: expect.any(Date),
      });

      expect(mockExecute).toHaveBeenCalledWith({ name: 'John Doe', username: 'johndoe' });
    });

    it('should throw an error if the user already exists', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('User already exists!'));

      CreateUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.createUser(
          null,
          { input: { name: 'John Doe', username: 'johndoe' } },
        ),
      ).rejects.toThrow('User already exists!');
    });

    it('should throw a validation error if required fields are missing', async () => {
      await expect(
        usersResolvers.Mutation.createUser(
          null,
          { input: { name: '', username: '' } },
        ),
      ).rejects.toThrow('Validation failed: Missing required fields.');
    });

    it('should throw an internal server error if error has no message', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error());

      CreateUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.createUser(
          null,
          { input: { name: 'John Doe', username: 'johndoe' } },
        ),
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('updateUser Resolver', () => {
    it('should update a user', async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        _id: '123',
        name: 'John Doe Updated',
        username: 'johndoeupdated',
        createdAt: new Date(),
      });

      UpdateUserService.prototype.execute = mockExecute;

      const response = await usersResolvers.Mutation.updateUser(
        null,
        { id: '123', input: { name: 'John Doe Updated', username: 'johndoeupdated' } },
      );

      expect(response).toEqual({
        _id: '123',
        name: 'John Doe Updated',
        username: 'johndoeupdated',
        createdAt: expect.any(Date),
      });

      expect(mockExecute).toHaveBeenCalledWith({
        id: '123',
        name: 'John Doe Updated',
        username: 'johndoeupdated',
      });
    });

    it('should throw an error if the user is not found', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('User not found'));

      UpdateUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '123', input: { name: 'New Name' } },
        ),
      ).rejects.toThrow('User not found');
    });

    it('should throw a validation error if the ID is missing', async () => {
      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '', input: { name: 'New Name' } },
        ),
      ).rejects.toThrow('Validation failed: Missing required fields.');
    });

    it('should throw a validation error if neither name nor username are provided', async () => {
      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '123', input: {} },
        ),
      ).rejects.toThrow('Validation failed: Missing required fields.');
    });

    it('should throw an internal server error if error has no message', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error());

      UpdateUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '123', input: { name: 'New Name' } },
        ),
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('deleteUser Resolver', () => {
    it('should delete a user', async () => {
      const mockExecute = jest.fn().mockResolvedValue(null);

      DeleteUserService.prototype.execute = mockExecute;

      const response = await usersResolvers.Mutation.deleteUser(
        null,
        { id: '123' },
      );

      expect(response).toBe(true);
    });

    it('should throw an error if the user is not found', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('User not found'));

      DeleteUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.deleteUser(
          null,
          { id: '123' },
        ),
      ).rejects.toThrow('User not found');
    });

    it('should throw a validation error if the ID is missing', async () => {
      await expect(
        usersResolvers.Mutation.deleteUser(
          null,
          { id: '' },
        ),
      ).rejects.toThrow('Validation failed: Missing user ID.');
    });

    it('should throw an internal server error if error has no message', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error());

      DeleteUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.deleteUser(
          null,
          { id: '123' },
        ),
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('getAllUsers Resolver', () => {
    it('should return all users', async () => {
      const mockExecute = jest.fn().mockResolvedValue([
        {
          _id: '123', name: 'John Doe', username: 'johndoe', createdAt: new Date(),
        },
      ]);

      GetUsersService.prototype.execute = mockExecute;

      const response = await usersResolvers.Query.getAllUsers();

      expect(response).toEqual([
        {
          _id: '123', name: 'John Doe', username: 'johndoe', createdAt: expect.any(Date),
        },
      ]);
    });

    it('should throw an error if no users are found', async () => {
      const mockExecute = jest.fn().mockResolvedValue(null);

      GetUsersService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getAllUsers(),
      ).rejects.toThrow('Users not found');
    });

    it('should throw an error if the user list is empty', async () => {
      const mockExecute = jest.fn().mockResolvedValue([]);

      GetUsersService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getAllUsers(),
      ).rejects.toThrow('Users not found');
    });

    it('should throw an internal server error if error has no message', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error());

      GetUsersService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getAllUsers(),
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('getUserById Resolver', () => {
    it('should return a user by ID', async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        _id: '123',
        name: 'John Doe',
        username: 'johndoe',
        createdAt: new Date(),
      });

      GetUserByIdService.prototype.execute = mockExecute;

      const response = await usersResolvers.Query.getUserById(
        null,
        { id: '123' },
      );

      expect(response).toEqual({
        _id: '123',
        name: 'John Doe',
        username: 'johndoe',
        createdAt: expect.any(Date),
      });
    });

    it('should throw an error if the user is not found', async () => {
      const mockExecute = jest.fn().mockResolvedValue(null);

      GetUserByIdService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getUserById(
          null,
          { id: '123' },
        ),
      ).rejects.toThrow('User not found');
    });

    it('should throw a validation error if the ID is missing', async () => {
      await expect(
        usersResolvers.Query.getUserById(
          null,
          { id: '' },
        ),
      ).rejects.toThrow('Validation failed: Missing user ID.');
    });

    it('should throw an internal server error if error has no message', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error());

      GetUserByIdService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getUserById(
          null,
          { id: '123' },
        ),
      ).rejects.toThrow('Internal server error');
    });
  });
});
