import 'reflect-metadata';
import { Request, Response } from 'express';
import { UpdatePostController } from '../UpdatePostController';
import { UpdatePostService } from '../UpdatePostService';

jest.mock('../UpdatePostService');

describe('UpdatePostController', () => {
  let updatePostController: UpdatePostController;

  beforeEach(() => {
    updatePostController = new UpdatePostController();
    jest.clearAllMocks();
  });

  it('should update a post successfully', async () => {
    const mockPost = {
      id: '1',
      title: 'New Title',
      content: 'New Content',
      save: jest.fn(),
    };

    (UpdatePostService.prototype.execute as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: '1' },
      body: { title: 'New Title', content: 'New Content' },
    } as unknown as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await updatePostController.handle(req, res);

    expect(UpdatePostService.prototype.execute).toHaveBeenCalledWith({
      id: '1',
      title: 'New Title',
      content: 'New Content',
    });

    expect(res.json).toHaveBeenCalledWith(mockPost);
  });

  it('should return 400 if no id is provided', async () => {
    const req = {
      params: {},
      body: { title: 'New Title' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updatePostController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed: Missing required fields.',
    });
  });

  it('should return 400 if no title or content is provided', async () => {
    const req = {
      params: { id: '1' },
      body: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updatePostController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed: Missing required fields.',
    });
  });

  it('should return 404 if post is not found', async () => {
    (UpdatePostService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Post not found'));

    const req = {
      params: { id: '1' },
      body: { title: 'New Title', content: 'New Content' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updatePostController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  it('should return 500 for unexpected errors', async () => {
    (UpdatePostService.prototype.execute as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

    const req = {
      params: { id: '1' },
      body: { title: 'New Title', content: 'New Content' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updatePostController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
  });

  it('should return 500 with default message if error has no message', async () => {
    (UpdatePostService.prototype.execute as jest.Mock).mockRejectedValue({});

    const req = {
      params: { id: '1' },
      body: { title: 'New Title', content: 'New Content' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await updatePostController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
