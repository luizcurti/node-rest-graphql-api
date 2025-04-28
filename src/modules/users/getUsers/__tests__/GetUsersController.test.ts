import { Request, Response } from 'express';
import { GetUsersController } from '../GetUsersController';
import { GetUsersService } from '../GetUsersService';

jest.mock('../GetUsersService');

describe('GetUsersController', () => {
  let getUsersController: GetUsersController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getUsersController = new GetUsersController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it('should return 200 and the list of users', async () => {
    const mockUsers = [
      { id: '1', name: 'User One', email: 'user1@example.com' },
      { id: '2', name: 'User Two', email: 'user2@example.com' },
    ];
    (GetUsersService.prototype.execute as jest.Mock).mockResolvedValue(mockUsers);

    await getUsersController.handle(req as Request, res as Response);

    expect(GetUsersService.prototype.execute).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith(mockUsers);
    expect(statusMock).toHaveBeenCalledWith(200);
  });

  it('should return 404 when no users are found', async () => {
    (GetUsersService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Users not found'));

    await getUsersController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Users not found' });
  });

  it('should return 500 for other errors with a specific message', async () => {
    (GetUsersService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getUsersController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Database error' });
  });

  it('should return 500 with default message if error has no message', async () => {
    (GetUsersService.prototype.execute as jest.Mock).mockRejectedValue({});

    await getUsersController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
