import { Request, Response } from 'express';
import { CreateUserController } from '../CreateUserController';
import { CreateUserService } from '../CreateUserService';

jest.mock('../CreateUserService');

describe('CreateUserController', () => {
  let createUserController: CreateUserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createUserController = new CreateUserController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = { body: { name: 'John Doe', username: 'johndoe' } };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it('should create a user successfully', async () => {
    const createdUser = { id: '1', name: 'John Doe', username: 'johndoe' };

    (CreateUserService.prototype.execute as jest.Mock).mockResolvedValue(createdUser);

    await createUserController.handle(req as Request, res as Response);

    expect(CreateUserService.prototype.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      username: 'johndoe',
    });
    expect(jsonMock).toHaveBeenCalledWith(createdUser);
    expect(statusMock).toHaveBeenCalledWith(200);
  });

  it('should return 400 if validation fails', async () => {
    req.body = {};

    await createUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Validation failed' });
  });

  it('should return 400 if user already exists', async () => {
    (CreateUserService.prototype.execute as jest.Mock).mockRejectedValue(new Error('User already exists!'));

    await createUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'User already exists!' });
  });

  it('should return 500 on other errors', async () => {
    (CreateUserService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Database error'));

    await createUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
  });

  it('should return 500 with default message if error has no message', async () => {
    (CreateUserService.prototype.execute as jest.Mock).mockRejectedValue({});

    await createUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
