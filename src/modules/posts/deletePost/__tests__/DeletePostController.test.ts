import { Request, Response } from 'express';
import { DeletePostController } from '../DeletePostController';
import { DeletePostService } from '../DeletePostService';

jest.mock('../DeletePostService');

describe('DeletePostController', () => {
  let deletePostController: DeletePostController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    deletePostController = new DeletePostController();

    req = {
      params: { id: '1' },
    };

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnThis();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a post and return 204', async () => {
    (DeletePostService.prototype.execute as jest.Mock).mockResolvedValueOnce(true);

    await deletePostController.handle(req as Request, res as Response);

    expect(DeletePostService.prototype.execute).toHaveBeenCalledWith('1');
    expect(statusMock).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalled();
  });

  it('should return 404 if post is not found', async () => {
    (DeletePostService.prototype.execute as jest.Mock).mockRejectedValueOnce(new Error('Post not found'));

    await deletePostController.handle(req as Request, res as Response);

    expect(DeletePostService.prototype.execute).toHaveBeenCalledWith('1');
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 500 for unexpected errors', async () => {
    (DeletePostService.prototype.execute as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));

    await deletePostController.handle(req as Request, res as Response);

    expect(DeletePostService.prototype.execute).toHaveBeenCalledWith('1');
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Unexpected error' });
  });

  it('should return 500 with "Internal server error" if error.message is undefined', async () => {
    (DeletePostService.prototype.execute as jest.Mock).mockRejectedValueOnce({});

    await deletePostController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
