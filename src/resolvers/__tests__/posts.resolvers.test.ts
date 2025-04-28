import { CreatePostService } from '@modules/posts/createPost/CreatePostService';
import { UpdatePostService } from '@modules/posts/updatePost/UpdatePostService';
import { DeletePostService } from '@modules/posts/deletePost/DeletePostService';
import { GetPostsService } from '@modules/posts/getPosts/GetPostsService';
import { GetPostByIdService } from '@modules/posts/getPostById/GetPostByIdService';
import { GetPostsByUserService } from '@modules/posts/getPostsByUser/GetPostsByUserService';
import postsResolvers from '../posts.resolvers';

jest.mock('@modules/posts/createPost/CreatePostService');
jest.mock('@modules/posts/updatePost/UpdatePostService');
jest.mock('@modules/posts/deletePost/DeletePostService');
jest.mock('@modules/posts/getPosts/GetPostsService');
jest.mock('@modules/posts/getPostById/GetPostByIdService');
jest.mock('@modules/posts/getPostsByUser/GetPostsByUserService');

describe('Posts Resolvers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mutation', () => {
    describe('createPost', () => {
      it('should create a post successfully', async () => {
        const mockExecute = jest.fn().mockResolvedValue({
          id: '1', title: 'Post', content: 'Content', author: '123',
        });
        (CreatePostService as jest.Mock).mockImplementation(() => ({
          execute: mockExecute,
        }));

        const input = { title: 'Post', content: 'Content', author: '123' };

        const result = await postsResolvers.Mutation.createPost(null, { input });

        expect(result).toEqual({
          id: '1', title: 'Post', content: 'Content', author: '123',
        });
        expect(mockExecute).toHaveBeenCalledWith(input);
      });

      it('should throw error if missing fields', async () => {
        await expect(postsResolvers.Mutation.createPost(null, { input: { title: '', content: '', author: '' } }))
          .rejects.toThrow('Validation failed: Missing required fields.');
      });

      it('should throw generic internal server error on createPost', async () => {
        (CreatePostService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error()),
        }));

        const input = { title: 'Post', content: 'Content', author: '123' };

        await expect(postsResolvers.Mutation.createPost(null, { input }))
          .rejects.toThrow('Internal server error');
      });
    });

    describe('updatePost', () => {
      it('should update a post successfully', async () => {
        const mockExecute = jest.fn().mockResolvedValue({ id: '1', title: 'Updated', content: 'Updated content' });
        (UpdatePostService as jest.Mock).mockImplementation(() => ({
          execute: mockExecute,
        }));

        const id = '1';
        const input = { title: 'Updated', content: 'Updated content' };

        const result = await postsResolvers.Mutation.updatePost(null, { id, input });

        expect(result).toEqual({ id: '1', title: 'Updated', content: 'Updated content' });
        expect(mockExecute).toHaveBeenCalledWith({ id, ...input });
      });

      it('should throw error if id missing', async () => {
        await expect(postsResolvers.Mutation.updatePost(null, { id: '', input: { title: 'x' } }))
          .rejects.toThrow('Validation failed: Missing required fields.');
      });

      it('should throw error if neither title nor content provided', async () => {
        const id = '1';
        const input = { title: '', content: '' };

        await expect(postsResolvers.Mutation.updatePost(null, { id, input }))
          .rejects.toThrow('Validation failed: Missing required fields.');
      });

      it('should throw error if post not found', async () => {
        (UpdatePostService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error('Post not found')),
        }));

        await expect(postsResolvers.Mutation.updatePost(null, { id: '999', input: { title: 'x' } }))
          .rejects.toThrow('Post not found');
      });

      it('should throw generic internal server error on updatePost', async () => {
        (UpdatePostService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error()),
        }));

        const id = '1';
        const input = { title: 'Updated', content: 'Updated content' };

        await expect(postsResolvers.Mutation.updatePost(null, { id, input }))
          .rejects.toThrow('Internal server error');
      });
    });

    describe('deletePost', () => {
      it('should delete a post successfully', async () => {
        const mockExecute = jest.fn().mockResolvedValue(undefined);
        (DeletePostService as jest.Mock).mockImplementation(() => ({
          execute: mockExecute,
        }));

        const id = '1';

        const result = await postsResolvers.Mutation.deletePost(null, { id });

        expect(result).toBe(true);
        expect(mockExecute).toHaveBeenCalledWith(id);
      });

      it('should throw error if id missing', async () => {
        await expect(postsResolvers.Mutation.deletePost(null, { id: '' }))
          .rejects.toThrow('Validation failed: Missing post ID.');
      });

      it('should throw error if post not found', async () => {
        (DeletePostService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error('Post not found')),
        }));

        await expect(postsResolvers.Mutation.deletePost(null, { id: '999' }))
          .rejects.toThrow('Post not found');
      });

      it('should throw generic internal server error on deletePost', async () => {
        (DeletePostService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error()),
        }));

        const id = '1';

        await expect(postsResolvers.Mutation.deletePost(null, { id }))
          .rejects.toThrow('Internal server error');
      });
    });
  });

  describe('Query', () => {
    describe('getAllPosts', () => {
      it('should get all posts successfully', async () => {
        const mockExecute = jest.fn().mockResolvedValue([{
          id: '1', title: 'Post', content: 'Content', author: '123',
        }]);
        (GetPostsService as jest.Mock).mockImplementation(() => ({
          execute: mockExecute,
        }));

        const result = await postsResolvers.Query.getAllPosts();

        expect(result).toEqual([{
          id: '1', title: 'Post', content: 'Content', author: '123',
        }]);
        expect(mockExecute).toHaveBeenCalled();
      });

      it('should throw error if no posts found', async () => {
        (GetPostsService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockResolvedValue([]),
        }));

        await expect(postsResolvers.Query.getAllPosts())
          .rejects.toThrow('No posts found');
      });

      it('should throw generic internal server error on getAllPosts', async () => {
        (GetPostsService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error()),
        }));

        await expect(postsResolvers.Query.getAllPosts())
          .rejects.toThrow('Internal server error');
      });
    });

    describe('getPostById', () => {
      it('should get post by id successfully', async () => {
        const mockExecute = jest.fn().mockResolvedValue({ id: '1', title: 'Post', content: 'Content' });
        (GetPostByIdService as jest.Mock).mockImplementation(() => ({
          execute: mockExecute,
        }));

        const id = '1';

        const result = await postsResolvers.Query.getPostById(null, { id });

        expect(result).toEqual({ id: '1', title: 'Post', content: 'Content' });
        expect(mockExecute).toHaveBeenCalledWith(id);
      });

      it('should throw error if id missing', async () => {
        await expect(postsResolvers.Query.getPostById(null, { id: '' }))
          .rejects.toThrow('Validation failed: Missing post ID.');
      });

      it('should throw error if post not found', async () => {
        (GetPostByIdService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockResolvedValue(null),
        }));

        await expect(postsResolvers.Query.getPostById(null, { id: 'nonexistent' }))
          .rejects.toThrow('Post not found');
      });

      it('should throw generic internal server error on getPostById', async () => {
        (GetPostByIdService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error()),
        }));

        const id = '1';

        await expect(postsResolvers.Query.getPostById(null, { id }))
          .rejects.toThrow('Internal server error');
      });
    });

    describe('getPostsByUser', () => {
      it('should get posts by user successfully', async () => {
        const mockExecute = jest.fn().mockResolvedValue([{ id: '1', title: 'Post', content: 'Content' }]);
        (GetPostsByUserService as jest.Mock).mockImplementation(() => ({
          execute: mockExecute,
        }));

        const idUser = 'user-id';

        const result = await postsResolvers.Query.getPostsByUser(null, { idUser });

        expect(result).toEqual([{ id: '1', title: 'Post', content: 'Content' }]);
        expect(mockExecute).toHaveBeenCalledWith(idUser);
      });

      it('should throw error if id missing', async () => {
        await expect(postsResolvers.Query.getPostsByUser(null, { idUser: '' }))
          .rejects.toThrow('Validation failed: Missing user ID.');
      });

      it('should throw error if no posts found', async () => {
        (GetPostsByUserService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockResolvedValue([]),
        }));

        await expect(postsResolvers.Query.getPostsByUser(null, { idUser: 'user-id' }))
          .rejects.toThrow('No posts found');
      });

      it('should throw generic internal server error on getPostsByUser', async () => {
        (GetPostsByUserService as jest.Mock).mockImplementation(() => ({
          execute: jest.fn().mockRejectedValue(new Error()),
        }));

        await expect(postsResolvers.Query.getPostsByUser(null, { idUser: 'user-id' }))
          .rejects.toThrow('Internal server error');
      });
    });
  });
});
