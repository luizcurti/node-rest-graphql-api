import { CreatePostService } from '../modules/posts/createPost/CreatePostService';
import { UpdatePostService } from '../modules/posts/updatePost/UpdatePostService';
import { DeletePostService } from '../modules/posts/deletePost/DeletePostService';
import { GetPostsService } from '../modules/posts/getPosts/GetPostsService';
import { GetPostByIdService } from '../modules/posts/getPostById/GetPostByIdService';
import { GetPostsByUserService } from '../modules/posts/getPostsByUser/GetPostsByUserService';

const postsResolvers = {
  Mutation: {
    async createPost(_, { input }) {
      try {
        const { title, content, author } = input;

        if (!title || !content || !author) {
          throw new Error('Validation failed: Missing required fields.');
        }

        const createPostService = new CreatePostService();
        const post = await createPostService.execute({ title, content, author });

        return post;
      } catch (error) {
        throw new Error(error.message || 'Internal server error');
      }
    },

    async updatePost(_, { id, input }) {
      try {
        const { title, content } = input;

        if (!id || (!title && !content)) {
          throw new Error('Validation failed: Missing required fields.');
        }

        const updatePostService = new UpdatePostService();
        const post = await updatePostService.execute({ id, title, content });

        return post;
      } catch (error) {
        if (error.message === 'Post not found') {
          throw new Error('Post not found');
        }
        throw new Error(error.message || 'Internal server error');
      }
    },

    async deletePost(_, { id }) {
      try {
        if (!id) {
          throw new Error('Validation failed: Missing post ID.');
        }

        const deletePostService = new DeletePostService();
        await deletePostService.execute(id);

        return true;
      } catch (error) {
        if (error.message === 'Post not found') {
          throw new Error('Post not found');
        }
        throw new Error(error.message || 'Internal server error');
      }
    },
  },

  Query: {
    async getAllPosts() {
      try {
        const getPostsService = new GetPostsService();
        const posts = await getPostsService.execute();

        if (posts.length === 0) {
          throw new Error('No posts found');
        }

        return posts;
      } catch (error) {
        throw new Error(error.message || 'Internal server error');
      }
    },

    async getPostById(_, { id }) {
      try {
        if (!id) {
          throw new Error('Validation failed: Missing post ID.');
        }

        const getPostByIdService = new GetPostByIdService();
        const post = await getPostByIdService.execute(id);

        if (!post) {
          throw new Error('Post not found');
        }

        return post;
      } catch (error) {
        throw new Error(error.message || 'Internal server error');
      }
    },

    async getPostsByUser(_, { idUser }) {
      try {
        if (!idUser) {
          throw new Error('Validation failed: Missing user ID.');
        }

        const getPostsByUserService = new GetPostsByUserService();
        const posts = await getPostsByUserService.execute(idUser);

        if (posts.length === 0) {
          throw new Error('No posts found');
        }

        return posts;
      } catch (error) {
        throw new Error(error.message || 'Internal server error');
      }
    },
  },
};

export default postsResolvers;
