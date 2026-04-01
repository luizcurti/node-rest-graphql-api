/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../server';
import { setupTestDB } from './dbHelper';

setupTestDB();

const GQL = '/graphql';
const USERS_REST = '/users';

// Helper for GraphQL requests
const gql = (query: string, variables?: Record<string, unknown>) => request(app)
  .post(GQL)
  .set('Content-Type', 'application/json')
  .send({ query, variables });

let authorId: string;

beforeEach(async () => {
  const res = await request(app)
    .post(USERS_REST)
    .send({ name: 'Post Author', username: 'post_author' });
  authorId = res.body._id;
});

describe('GraphQL — Posts CRUD (Docker MongoDB)', () => {
  // ─────────────────────────────────────────────
  // Mutation: createPost
  // ─────────────────────────────────────────────
  describe('createPost', () => {
    const CREATE_POST = `
      mutation createPost($input: PostInput!) {
        createPost(input: $input) {
          _id
          title
          content
          createdAt
          author {
            _id
            name
            username
          }
        }
      }
    `;

    it('creates post and returns complete data with populated author', async () => {
      const res = await gql(CREATE_POST, {
        input: { title: 'GraphQL Post', content: 'GraphQL content', author: authorId },
      });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      const { createPost } = res.body.data;
      expect(createPost._id).toBeDefined();
      expect(createPost.title).toBe('GraphQL Post');
      expect(createPost.content).toBe('GraphQL content');
      expect(createPost.createdAt).toBeDefined();
      expect(createPost.author).toMatchObject({ username: 'post_author' });
    });

    it('error – missing title (empty)', async () => {
      const res = await gql(CREATE_POST, {
        input: { title: '', content: 'C', author: authorId },
      });
      expect(res.body.errors[0].message).toContain('Validation failed');
    });

    it('error – missing content (empty)', async () => {
      const res = await gql(CREATE_POST, {
        input: { title: 'T', content: '', author: authorId },
      });
      expect(res.body.errors[0].message).toContain('Validation failed');
    });

    it('error – missing author (empty)', async () => {
      const res = await gql(CREATE_POST, {
        input: { title: 'T', content: 'C', author: '' },
      });
      expect(res.body.errors[0].message).toContain('Validation failed');
    });

    it('error – duplicate title', async () => {
      await gql(CREATE_POST, { input: { title: 'Dup GQL', content: 'C1', author: authorId } });
      const res = await gql(CREATE_POST, { input: { title: 'Dup GQL', content: 'C2', author: authorId } });
      expect(res.body.errors[0].message).toContain('Post with this title already exists!');
    });
  });

  // ─────────────────────────────────────────────
  // Query: getAllPosts
  // ─────────────────────────────────────────────
  describe('getAllPosts', () => {
    const CREATE_POST = `
      mutation createPost($input: PostInput!) {
        createPost(input: $input) { _id title }
      }
    `;

    const GET_ALL_POSTS = `
      query {
        getAllPosts {
          _id
          title
          content
          createdAt
          author {
            _id
            name
            username
          }
        }
      }
    `;

    it('returns all posts with populated author', async () => {
      await gql(CREATE_POST, { input: { title: 'P1', content: 'C1', author: authorId } });
      await gql(CREATE_POST, { input: { title: 'P2', content: 'C2', author: authorId } });

      const res = await gql(GET_ALL_POSTS);
      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.getAllPosts).toHaveLength(2);
      expect(res.body.data.getAllPosts[0].author).toMatchObject({ username: 'post_author' });
    });

    it('each post has complete fields', async () => {
      await gql(CREATE_POST, { input: { title: 'Fields Post', content: 'Body', author: authorId } });
      const res = await gql(GET_ALL_POSTS);
      const [post] = res.body.data.getAllPosts;
      expect(post).toHaveProperty('_id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('createdAt');
      expect(post.author).toHaveProperty('_id');
      expect(post.author).toHaveProperty('name');
      expect(post.author).toHaveProperty('username');
    });

    it('error – no posts (empty list triggers error in GraphQL resolver)', async () => {
      // GraphQL resolver throws error when no posts exist (different behavior from REST)
      const res = await gql(GET_ALL_POSTS);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe('No posts found');
    });
  });

  // ─────────────────────────────────────────────
  // Query: getPostById
  // ─────────────────────────────────────────────
  describe('getPostById', () => {
    const CREATE_POST = `
      mutation createPost($input: PostInput!) {
        createPost(input: $input) { _id title }
      }
    `;

    const GET_POST_BY_ID = `
      query getPostById($id: ID!) {
        getPostById(id: $id) {
          _id
          title
          content
          createdAt
          author {
            _id
            name
            username
          }
        }
      }
    `;

    it('returns post by ID with populated author', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Get by ID Post', content: 'Content body', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(GET_POST_BY_ID, { id: _id });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.getPostById).toMatchObject({
        title: 'Get by ID Post',
        content: 'Content body',
      });
      expect(res.body.data.getPostById.author._id).toBe(authorId);
    });

    it('error – ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await gql(GET_POST_BY_ID, { id: fakeId });
      expect(res.body.errors[0].message).toBe('Post not found');
    });

    it('returned post fields are complete', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Full Fields', content: 'Full Body', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(GET_POST_BY_ID, { id: _id });
      const post = res.body.data.getPostById;
      expect(post).toHaveProperty('_id');
      expect(post).toHaveProperty('title', 'Full Fields');
      expect(post).toHaveProperty('content', 'Full Body');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('author');
    });
  });

  // ─────────────────────────────────────────────
  // Query: getPostsByUser
  // ─────────────────────────────────────────────
  describe('getPostsByUser', () => {
    const CREATE_POST = `
      mutation createPost($input: PostInput!) {
        createPost(input: $input) { _id title }
      }
    `;

    const GET_POSTS_BY_USER = `
      query getPostsByUser($idUser: ID!) {
        getPostsByUser(idUser: $idUser) {
          _id
          title
          content
          author {
            _id
            username
          }
        }
      }
    `;

    it('returns user posts with populated author', async () => {
      await gql(CREATE_POST, { input: { title: 'User Post A', content: 'C', author: authorId } });
      await gql(CREATE_POST, { input: { title: 'User Post B', content: 'C', author: authorId } });

      const res = await gql(GET_POSTS_BY_USER, { idUser: authorId });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.getPostsByUser).toHaveLength(2);
      expect(res.body.data.getPostsByUser[0].author._id).toBe(authorId);
    });

    it('returns only posts of the requested user', async () => {
      const otherRes = await request(app)
        .post(USERS_REST)
        .send({ name: 'Other User', username: 'other_gql' });
      const otherId = otherRes.body._id;

      await gql(CREATE_POST, { input: { title: 'My GQL Post', content: 'C', author: authorId } });
      await gql(CREATE_POST, { input: { title: 'Other GQL Post', content: 'C', author: otherId } });

      const res = await gql(GET_POSTS_BY_USER, { idUser: authorId });
      expect(res.body.data.getPostsByUser).toHaveLength(1);
      expect(res.body.data.getPostsByUser[0].title).toBe('My GQL Post');
    });

    it('error – user with no posts throws error in GraphQL resolver', async () => {
      const emptyUser = await request(app)
        .post(USERS_REST)
        .send({ name: 'Empty', username: 'empty_gql' });

      const res = await gql(GET_POSTS_BY_USER, { idUser: emptyUser.body._id });
      // GraphQL resolver throws 'No posts found' when list is empty
      expect(res.body.errors[0].message).toBe('No posts found');
    });
  });

  // ─────────────────────────────────────────────
  // Mutation: updatePost
  // ─────────────────────────────────────────────
  describe('updatePost', () => {
    const CREATE_POST = `
      mutation createPost($input: PostInput!) {
        createPost(input: $input) { _id }
      }
    `;

    const UPDATE_POST = `
      mutation updatePost($id: ID!, $input: UpdatePostInput!) {
        updatePost(id: $id, input: $input) {
          _id
          title
          content
          author {
            _id
            username
          }
        }
      }
    `;

    it('updates title', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Old Title GQL', content: 'Body', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(UPDATE_POST, { id: _id, input: { title: 'New Title GQL' } });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.updatePost.title).toBe('New Title GQL');
      expect(res.body.data.updatePost.content).toBe('Body');
    });

    it('updates content', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Fixed GQL Title', content: 'Old Body', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(UPDATE_POST, { id: _id, input: { content: 'New Body GQL' } });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.updatePost.content).toBe('New Body GQL');
      expect(res.body.data.updatePost.title).toBe('Fixed GQL Title');
    });

    it('updates title and content together', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Old T', content: 'Old C', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(UPDATE_POST, { id: _id, input: { title: 'New T', content: 'New C' } });
      expect(res.body.data.updatePost).toMatchObject({ title: 'New T', content: 'New C' });
    });

    it('error – ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await gql(UPDATE_POST, { id: fakeId, input: { title: 'Ghost' } });
      expect(res.body.errors[0].message).toBe('Post not found');
    });

    it('error – no fields in input', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Valid Title', content: 'Body', author: authorId },
      });
      const { _id } = created.body.data.createPost;
      const res = await gql(UPDATE_POST, { id: _id, input: {} });
      expect(res.body.errors[0].message).toContain('Validation failed');
    });

    it('author remains the same after update', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Author Stays', content: 'Body', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(UPDATE_POST, { id: _id, input: { title: 'Updated Title' } });
      expect(res.body.data.updatePost.author._id).toBe(authorId);
    });
  });

  // ─────────────────────────────────────────────
  // Mutation: deletePost
  // ─────────────────────────────────────────────
  describe('deletePost', () => {
    const CREATE_POST = `
      mutation createPost($input: PostInput!) {
        createPost(input: $input) { _id }
      }
    `;

    const DELETE_POST = `
      mutation deletePost($id: ID!) {
        deletePost(id: $id)
      }
    `;

    const GET_POST_BY_ID = `
      query getPostById($id: ID!) {
        getPostById(id: $id) { _id }
      }
    `;

    it('deletes post and returns true', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Delete GQL', content: 'C', author: authorId },
      });
      const { _id } = created.body.data.createPost;

      const res = await gql(DELETE_POST, { id: _id });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.deletePost).toBe(true);
    });

    it('post no longer exists after delete', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Gone GQL', content: 'C', author: authorId },
      });
      const { _id } = created.body.data.createPost;
      await gql(DELETE_POST, { id: _id });

      const res = await gql(GET_POST_BY_ID, { id: _id });
      expect(res.body.errors[0].message).toBe('Post not found');
    });

    it('error – ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await gql(DELETE_POST, { id: fakeId });
      expect(res.body.errors[0].message).toBe('Post not found');
    });

    it('cannot delete the same post twice', async () => {
      const created = await gql(CREATE_POST, {
        input: { title: 'Double Del GQL', content: 'C', author: authorId },
      });
      const { _id } = created.body.data.createPost;
      await gql(DELETE_POST, { id: _id });
      const res = await gql(DELETE_POST, { id: _id });
      expect(res.body.errors[0].message).toBe('Post not found');
    });
  });
});
