import { Request, Response } from 'express';
import { CreatePostController } from '../CreatePostController';
import { CreatePostService } from '../CreatePostService';

jest.mock('../CreatePostService');

describe('CreatePostController', () => {
  let createPostController: CreatePostController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    createPostController = new CreatePostController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = {
      body: { title: 'Test Title', content: 'Test Content', author: 'Test Author' },
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it('should return 400 if title, content or author are missing', async () => {
    req.body = {};

    await createPostController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Validation failed' });
  });

  it('should return 500 if an error occurs in the service', async () => {
    const mockExecute = CreatePostService.prototype.execute as jest.Mock;
    mockExecute.mockRejectedValueOnce(new Error('Something went wrong'));

    await createPostController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Something went wrong' });
  });

  it('should return 200 and post data if the post is created successfully', async () => {
    const mockExecute = CreatePostService.prototype.execute as jest.Mock;
    mockExecute.mockResolvedValueOnce({
      title: 'Test Title',
      content: 'Test Content',
      author: 'Test Author',
    });

    await createPostController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      title: 'Test Title',
      content: 'Test Content',
      author: 'Test Author',
    });
  });

  it('should return 500 if the post already exists', async () => {
    const mockExecute = CreatePostService.prototype.execute as jest.Mock;
    mockExecute.mockRejectedValueOnce(new Error('Post with this title already exists!'));

    await createPostController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Post with this title already exists!' });
  });

  it('should return 500 with "Internal server error" if error.message is undefined', async () => {
    const mockExecute = CreatePostService.prototype.execute as jest.Mock;
    mockExecute.mockRejectedValueOnce({});

    await createPostController.handle(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
