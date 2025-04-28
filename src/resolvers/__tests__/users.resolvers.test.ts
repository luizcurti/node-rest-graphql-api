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
    it('deve criar um novo usuário', async () => {
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

    it('deve lançar erro caso o usuário já exista', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('User already exists!'));

      CreateUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.createUser(
          null,
          { input: { name: 'John Doe', username: 'johndoe' } },
        ),
      ).rejects.toThrow('User already exists!');
    });

    it('deve lançar erro de validação se os campos obrigatórios estiverem ausentes', async () => {
      await expect(
        usersResolvers.Mutation.createUser(
          null,
          { input: { name: '', username: '' } },
        ),
      ).rejects.toThrow('Validation failed: Missing required fields.');
    });

    it('deve lançar erro de servidor interno caso erro sem message', async () => {
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
    it('deve atualizar um usuário', async () => {
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

    it('deve lançar erro se o usuário não for encontrado', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('User not found'));

      UpdateUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '123', input: { name: 'New Name' } },
        ),
      ).rejects.toThrow('User not found');
    });

    it('deve lançar erro de validação se o ID estiver ausente', async () => {
      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '', input: { name: 'New Name' } },
        ),
      ).rejects.toThrow('Validation failed: Missing required fields.');
    });

    it('deve lançar erro de validação se nem name nem username forem fornecidos', async () => {
      await expect(
        usersResolvers.Mutation.updateUser(
          null,
          { id: '123', input: {} },
        ),
      ).rejects.toThrow('Validation failed: Missing required fields.');
    });

    it('deve lançar erro de servidor interno caso erro sem message', async () => {
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
    it('deve deletar um usuário', async () => {
      const mockExecute = jest.fn().mockResolvedValue(null);

      DeleteUserService.prototype.execute = mockExecute;

      const response = await usersResolvers.Mutation.deleteUser(
        null,
        { id: '123' },
      );

      expect(response).toBe(true);
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error('User not found'));

      DeleteUserService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Mutation.deleteUser(
          null,
          { id: '123' },
        ),
      ).rejects.toThrow('User not found');
    });

    it('deve lançar erro de validação se o ID estiver ausente', async () => {
      await expect(
        usersResolvers.Mutation.deleteUser(
          null,
          { id: '' },
        ),
      ).rejects.toThrow('Validation failed: Missing user ID.');
    });

    it('deve lançar erro de servidor interno caso erro sem message', async () => {
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
    it('deve retornar todos os usuários', async () => {
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

    it('deve lançar erro se não encontrar usuários', async () => {
      const mockExecute = jest.fn().mockResolvedValue(null);

      GetUsersService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getAllUsers(),
      ).rejects.toThrow('Users not found');
    });

    it('deve lançar erro se a lista de usuários for vazia', async () => {
      const mockExecute = jest.fn().mockResolvedValue([]);

      GetUsersService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getAllUsers(),
      ).rejects.toThrow('Users not found');
    });

    it('deve lançar erro de servidor interno caso erro sem message', async () => {
      const mockExecute = jest.fn().mockRejectedValue(new Error());

      GetUsersService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getAllUsers(),
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('getUserById Resolver', () => {
    it('deve retornar o usuário pelo ID', async () => {
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

    it('deve lançar erro se o usuário não for encontrado', async () => {
      const mockExecute = jest.fn().mockResolvedValue(null);

      GetUserByIdService.prototype.execute = mockExecute;

      await expect(
        usersResolvers.Query.getUserById(
          null,
          { id: '123' },
        ),
      ).rejects.toThrow('User not found');
    });

    it('deve lançar erro de validação se o ID estiver ausente', async () => {
      await expect(
        usersResolvers.Query.getUserById(
          null,
          { id: '' },
        ),
      ).rejects.toThrow('Validation failed: Missing user ID.');
    });

    it('deve lançar erro de servidor interno caso erro sem message', async () => {
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
