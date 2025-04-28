import { Post } from '@models/Post';
import { GetPostsByUserService } from '../GetPostsByUserService';

jest.mock('@models/Post');

describe('GetPostsByUserService', () => {
  let service: GetPostsByUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GetPostsByUserService();
  });

  it('should return posts by user id', async () => {
    const mockPosts = [{ id: '1', title: 'Post 1' }];

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPosts);
    (Post.find as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute('user123');

    expect(Post.find).toHaveBeenCalledWith({ author: 'user123' });
    expect(populateMock).toHaveBeenCalledWith('author');
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(mockPosts);
  });

  it('should return empty array if no posts found', async () => {
    const mockPosts: unknown[] = [];

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPosts);
    (Post.find as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute('user123');

    expect(result).toEqual([]);
  });

  it('should throw error if Post.find fails', async () => {
    (Post.find as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(service.execute('user123')).rejects.toThrow('Database error');
  });
});
