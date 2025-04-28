import { Post } from '@models/Post';
import { GetPostByIdService } from '../GetPostByIdService';

jest.mock('@models/Post');

describe('GetPostByIdService', () => {
  let service: GetPostByIdService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GetPostByIdService();
  });

  it('should return a post when found', async () => {
    const mockPost = { id: '1', title: 'Test Post' };

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPost);
    (Post.findById as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute('post123');

    expect(Post.findById).toHaveBeenCalledWith('post123');
    expect(populateMock).toHaveBeenCalledWith('author');
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(mockPost);
  });

  it('should return null if no post is found', async () => {
    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(null);
    (Post.findById as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute('post123');

    expect(result).toBeNull();
  });

  it('should throw error if Post.findById fails', async () => {
    (Post.findById as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    await expect(service.execute('post123')).rejects.toThrow('Database error');
  });
});
