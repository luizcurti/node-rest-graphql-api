import 'reflect-metadata';
import { Request, Response } from 'express';
import { GetPostsByUserController } from '../GetPostsByUserController';
import { GetPostsByUserService } from '../GetPostsByUserService';

jest.mock('../GetPostsByUserService');

describe('GetPostsByUserController', () => {
  let controller: GetPostsByUserController;

  beforeEach(() => {
    controller = new GetPostsByUserController();
    jest.clearAllMocks();
  });

  it('should return posts with status 200', async () => {
    const mockPosts = [{ _id: '1', author: 'user1', content: 'Post 1' }];
    (GetPostsByUserService.prototype.execute as jest.Mock).mockResolvedValue(mockPosts);

    const req = { params: { id: 'user1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostsByUserService.prototype.execute).toHaveBeenCalledWith('user1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPosts);
  });

  it('should return 404 if no posts found', async () => {
    (GetPostsByUserService.prototype.execute as jest.Mock).mockResolvedValue([]);

    const req = { params: { id: 'user1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostsByUserService.prototype.execute).toHaveBeenCalledWith('user1');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'No posts found' });
  });

  it('should return 500 if an error occurs', async () => {
    const error = new Error('Something went wrong');
    (GetPostsByUserService.prototype.execute as jest.Mock).mockRejectedValue(error);

    const req = { params: { id: 'user1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostsByUserService.prototype.execute).toHaveBeenCalledWith('user1');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });

  it('should return 500 with "Internal server error" if error.message is undefined', async () => {
    (GetPostsByUserService.prototype.execute as jest.Mock).mockRejectedValue({});

    const req = { params: { id: 'user1' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostsByUserService.prototype.execute).toHaveBeenCalledWith('user1');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
