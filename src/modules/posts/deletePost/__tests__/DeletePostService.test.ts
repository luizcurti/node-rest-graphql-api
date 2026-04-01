import { Post } from '@models/Post';
import { DeletePostService } from '../DeletePostService';

jest.mock('@models/Post');

describe('DeletePostService', () => {
  let service: DeletePostService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DeletePostService();
  });

  it('should delete post successfully', async () => {
    const mockPost = { id: '1', title: 'Test Post' };
    (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(mockPost);

    await service.execute('1');

    expect(Post.findByIdAndDelete).toHaveBeenCalledWith('1');
  });

  it('should throw error if post is not found', async () => {
    (Post.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

    await expect(service.execute('1')).rejects.toThrow('Post not found');
  });

  it('should throw error if Post.findByIdAndDelete fails', async () => {
    (Post.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

    await expect(service.execute('1')).rejects.toThrow('Delete failed');
  });
});
