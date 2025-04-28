import 'reflect-metadata';
import { Request, Response } from 'express';
import { GetPostByIdController } from '../GetPostByIdController';
import { GetPostByIdService } from '../GetPostByIdService';

jest.mock('../GetPostByIdService');

describe('GetPostByIdController', () => {
  let controller: GetPostByIdController;

  beforeEach(() => {
    controller = new GetPostByIdController();
    jest.clearAllMocks();
  });

  it('should return the post with status 200', async () => {
    const mockPost = { id: '1', title: 'Test Post' };
    (GetPostByIdService.prototype.execute as jest.Mock).mockResolvedValue(mockPost);

    const req = { params: { id: 'post123' } } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostByIdService.prototype.execute).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPost);
  });

  it('should return 404 if post not found', async () => {
    (GetPostByIdService.prototype.execute as jest.Mock).mockResolvedValue(null);

    const req = { params: { id: 'post123' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostByIdService.prototype.execute).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 500 if service throws error', async () => {
    const error = new Error('Service error');
    (GetPostByIdService.prototype.execute as jest.Mock).mockRejectedValue(error);

    const req = { params: { id: 'post123' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(GetPostByIdService.prototype.execute).toHaveBeenCalledWith('post123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: error.message });
  });

  it('should return 500 with "Internal server error" if error.message is undefined', async () => {
    (GetPostByIdService.prototype.execute as jest.Mock).mockRejectedValueOnce({});

    const req = { params: { id: 'post123' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
