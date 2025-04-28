import 'reflect-metadata';
import { Request, Response } from 'express';
import { UpdateUserController } from '../UpdateUserController';
import { UpdateUserService } from '../UpdateUserService';

jest.mock('../UpdateUserService');

describe('UpdateUserController', () => {
  let updateUserController: UpdateUserController;

  beforeEach(() => {
    updateUserController = new UpdateUserController();
    jest.clearAllMocks();
  });

  it('should update a user successfully', async () => {
    const mockUser = {
      id: '680b660390d59316746bc274',
      name: 'Updated Name',
      username: 'updated_username',
    };

    (UpdateUserService.prototype.execute as jest.Mock).mockResolvedValue(mockUser);

    const req = {
      params: { id: '680b660390d59316746bc274' },
      body: { name: 'Updated Name', username: 'updated_username' },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(UpdateUserService.prototype.execute).toHaveBeenCalledWith({
      id: '680b660390d59316746bc274',
      name: 'Updated Name',
      username: 'updated_username',
    });

    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should return 400 if id or both name and username are missing', async () => {
    const req = {
      params: { id: '' },
      body: { name: '', username: '' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed: Missing required fields.',
    });
  });

  it('should return 404 if user is not found', async () => {
    (UpdateUserService.prototype.execute as jest.Mock).mockRejectedValue(new Error('User not found'));

    const req = {
      params: { id: 'invalid-id' },
      body: { name: 'Name', username: 'username' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 for any other error', async () => {
    (UpdateUserService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const req = {
      params: { id: 'some-id' },
      body: { name: 'Name', username: 'username' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected error' });
  });

  it('should continue normally if id is present even without name and username', async () => {
    (UpdateUserService.prototype.execute as jest.Mock).mockResolvedValue({ id: '123', name: 'Test', username: 'testuser' });

    const req = {
      params: { id: '123' },
      body: { },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(UpdateUserService.prototype.execute).toHaveBeenCalledWith({ id: '123', name: undefined, username: undefined });
    expect(res.json).toHaveBeenCalled();
  });

  it('should return 500 with default message if error has no message', async () => {
    (UpdateUserService.prototype.execute as jest.Mock).mockRejectedValue({});

    const req = {
      params: { id: 'some-id' },
      body: { name: 'Name', username: 'username' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('should return 400 if id is missing even if name or username are provided', async () => {
    const req = {
      params: { id: '' },
      body: { name: 'Name', username: '' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updateUserController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed: Missing required fields.',
    });
  });
});
