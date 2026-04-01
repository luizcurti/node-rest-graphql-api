import { Post } from '@models/Post';
import { GetPostsService } from '../GetPostsService';

jest.mock('@models/Post');

describe('GetPostsService', () => {
  let service: GetPostsService;

  beforeEach(() => {
    service = new GetPostsService();
    jest.clearAllMocks();
  });

  it('should return all posts with the author populated', async () => {
    const mockPosts = [
      {
        id: '1', title: 'Post 1', content: 'Content of post 1', author: 'user123',
      },
      {
        id: '2', title: 'Post 2', content: 'Content of post 2', author: 'user456',
      },
    ];

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPosts);
    (Post.find as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute();

    expect(Post.find).toHaveBeenCalledTimes(1);
    expect(populateMock).toHaveBeenCalledWith('author');
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(mockPosts);
  });

  it('should return an empty array if there are no posts', async () => {
    const mockPosts: unknown[] = [];

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPosts);
    (Post.find as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute();

    expect(result).toEqual([]);
  });

  it('should throw an error if the database query fails', async () => {
    (Post.find as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(service.execute()).rejects.toThrow('Database error');
  });
});
