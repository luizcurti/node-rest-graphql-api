import { Request, Response } from 'express';
import { DeleteUserController } from '../DeleteUserController';
import { DeleteUserService } from '../DeleteUserService';

jest.mock('../DeleteUserService');

describe('DeleteUserController', () => {
  let deleteUserController: DeleteUserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    deleteUserController = new DeleteUserController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    sendMock = jest.fn();

    req = { params: { id: '1' } };
    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  it('should delete the user and return status 204', async () => {
    (DeleteUserService.prototype.execute as jest.Mock).mockResolvedValue(undefined);

    await deleteUserController.handle(req as Request, res as Response);

    expect(DeleteUserService.prototype.execute).toHaveBeenCalledWith('1');
    expect(statusMock).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalled();
  });

  it('should return 404 if user is not found', async () => {
    (DeleteUserService.prototype.execute as jest.Mock).mockRejectedValue(new Error('User not found'));

    await deleteUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 for other errors', async () => {
    (DeleteUserService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Database error'));

    await deleteUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Database error' });
  });

  it('should return 500 with default message if error has no message', async () => {
    (DeleteUserService.prototype.execute as jest.Mock).mockRejectedValue({});

    await deleteUserController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
