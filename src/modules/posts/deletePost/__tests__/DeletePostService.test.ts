import { Post } from '@models/Post';
import { DeletePostService } from '../DeletePostService';

jest.mock('@models/Post');

describe('DeletePostService', () => {
  let service: DeletePostService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeletePostService();
  });

  it('should return true when post is successfully deleted', async () => {
    const mockPost = { id: '1', title: 'Test Post' };

    (Post.findById as jest.Mock).mockResolvedValue(mockPost);
    (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

    const result = await service.execute('1');

    expect(Post.findById).toHaveBeenCalledWith('1');
    expect(Post.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });

  it('should throw error if post is not found', async () => {
    (Post.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.execute('1')).rejects.toThrow('Post not found');
  });

  it('should throw error if Post.findByIdAndDelete fails', async () => {
    const mockPost = { id: '1', title: 'Test Post' };

    (Post.findById as jest.Mock).mockResolvedValue(mockPost);
    (Post.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    await expect(service.execute('1')).rejects.toThrow('Delete failed');
  });
});
