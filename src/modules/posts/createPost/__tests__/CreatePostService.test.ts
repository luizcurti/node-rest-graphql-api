import { Post } from '@models/Post';
import { CreatePostService } from '../CreatePostService';

jest.mock('@models/Post');

describe('CreatePostService', () => {
  let createPostService: CreatePostService;

  beforeEach(() => {
    createPostService = new CreatePostService();
    jest.clearAllMocks();
  });

  it('should throw an error if the post already exists', async () => {
    const mockFindOne = Post.findOne as jest.Mock;
    mockFindOne.mockResolvedValueOnce({ title: 'Test Title' });

    try {
      await createPostService.execute({
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
      });
    } catch (error) {
      expect(error.message).toBe('Post with this title already exists!');
    }
  });

  it('should create a post successfully', async () => {
    const mockFindOne = Post.findOne as jest.Mock;
    mockFindOne.mockResolvedValueOnce(null);

    const mockCreate = Post.create as jest.Mock;
    mockCreate.mockResolvedValueOnce({
      title: 'Test Title',
      content: 'Test Content',
      author: 'Test Author',
    });

    const post = await createPostService.execute({
      title: 'Test Title',
      content: 'Test Content',
      author: 'Test Author',
    });

    expect(post).toHaveProperty('title', 'Test Title');
    expect(post).toHaveProperty('content', 'Test Content');
    expect(post).toHaveProperty('author', 'Test Author');
    expect(Post.create).toHaveBeenCalledWith({
      title: 'Test Title',
      content: 'Test Content',
      author: 'Test Author',
    });
  });

  it('should throw an error if Post.create fails', async () => {
    const mockFindOne = Post.findOne as jest.Mock;
    mockFindOne.mockResolvedValueOnce(null);

    const mockCreate = Post.create as jest.Mock;
    mockCreate.mockRejectedValueOnce(new Error('Failed to create post'));

    try {
      await createPostService.execute({
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
      });
    } catch (error) {
      expect(error.message).toBe('Failed to create post');
    }
  });
});
