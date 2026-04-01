import { Post } from '@models/Post';
import { UpdatePostService } from '../UpdatePostService';

jest.mock('@models/Post');

describe('UpdatePostService', () => {
  let service: UpdatePostService;

  beforeEach(() => {
    service = new UpdatePostService();
    jest.clearAllMocks();
  });

  it('should update the post title and content', async () => {
    const mockPost = {
      id: '1', title: 'Old Title', content: 'Old Content', save: jest.fn(),
    };

    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const updateData = { id: '1', title: 'New Title', content: 'New Content' };

    const result = await service.execute(updateData);

    expect(Post.findById).toHaveBeenCalledWith('1');
    expect(mockPost.title).toBe('New Title');
    expect(mockPost.content).toBe('New Content');
    expect(mockPost.save).toHaveBeenCalled();
    expect(result).toEqual(mockPost);
  });

  it('should throw an error if the post is not found', async () => {
    (Post.findById as jest.Mock).mockResolvedValue(null);

    const updateData = { id: '1', title: 'New Title', content: 'New Content' };

    await expect(service.execute(updateData)).rejects.toThrow('Post not found');
  });

  it('should update only the post title', async () => {
    const mockPost = {
      id: '1', title: 'Old Title', content: 'Old Content', save: jest.fn(),
    };

    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const updateData = { id: '1', title: 'New Title' };

    const result = await service.execute(updateData);

    expect(mockPost.title).toBe('New Title');
    expect(mockPost.content).toBe('Old Content');
    expect(mockPost.save).toHaveBeenCalled();
    expect(result).toEqual(mockPost);
  });

  it('should update only the post content', async () => {
    const mockPost = {
      id: '1', title: 'Old Title', content: 'Old Content', save: jest.fn(),
    };

    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const updateData = { id: '1', content: 'New Content' };

    const result = await service.execute(updateData);

    expect(mockPost.title).toBe('Old Title');
    expect(mockPost.content).toBe('New Content');
    expect(mockPost.save).toHaveBeenCalled();
    expect(result).toEqual(mockPost);
  });
});
