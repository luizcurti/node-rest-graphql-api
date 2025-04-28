import 'reflect-metadata';
import { Request, Response } from 'express';
import { GetPostsController } from '../GetPostsController';
import { GetPostsService } from '../GetPostsService';

jest.mock('../GetPostsService');

describe('GetPostsController', () => {
  let controller: GetPostsController;

  beforeEach(() => {
    controller = new GetPostsController();
    jest.clearAllMocks();
  });

  it('should return posts with status 200', async () => {
    const mockPosts = [{ id: 1, title: 'Test Post' }];
    (GetPostsService.prototype.execute as jest.Mock).mockResolvedValue(mockPosts);

    const req = {} as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostsService.prototype.execute).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockPosts);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 404 when no posts are found', async () => {
    (GetPostsService.prototype.execute as jest.Mock).mockResolvedValue([]);

    const req = {} as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No posts found' });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    (GetPostsService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const req = {} as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected error' });
  });

  it('should return 500 with default message if error has no message', async () => {
    (GetPostsService.prototype.execute as jest.Mock).mockRejectedValue({});

    const req = {} as unknown as Request;
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
