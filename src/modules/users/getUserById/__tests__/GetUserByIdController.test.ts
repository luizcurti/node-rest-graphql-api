import { Request, Response } from 'express';
import { GetUserByIdController } from '../GetUserByIdController';
import { GetUserByIdService } from '../GetUserByIdService';

jest.mock('../GetUserByIdService');

describe('GetUserByIdController', () => {
  let getUserByIdController: GetUserByIdController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getUserByIdController = new GetUserByIdController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = { params: { id: '123' } };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it('should return 200 and the user when found', async () => {
    const mockUser = { id: '123', name: 'John Doe', email: 'john@example.com' };
    (GetUserByIdService.prototype.execute as jest.Mock).mockResolvedValue(mockUser);

    await getUserByIdController.handle(req as Request, res as Response);

    expect(GetUserByIdService.prototype.execute).toHaveBeenCalledWith('123');
    expect(jsonMock).toHaveBeenCalledWith(mockUser);
    expect(statusMock).toHaveBeenCalledWith(200);
  });

  it('should return 404 when user is not found', async () => {
    (GetUserByIdService.prototype.execute as jest.Mock).mockRejectedValue(new Error('User not found'));

    await getUserByIdController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 for other errors', async () => {
    (GetUserByIdService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getUserByIdController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Database error' });
  });

  it('should return 500 with default message if error has no message', async () => {
    (GetUserByIdService.prototype.execute as jest.Mock).mockRejectedValue({});

    await getUserByIdController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
