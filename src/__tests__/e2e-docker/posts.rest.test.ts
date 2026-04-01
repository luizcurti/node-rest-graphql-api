/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../server';
import { setupTestDB } from './dbHelper';

setupTestDB();

const USERS = '/users';
const POSTS = '/posts';

let authorId: string;

beforeEach(async () => {
  const res = await request(app)
    .post(USERS)
    .send({ name: 'Author', username: 'author_user' });
  authorId = res.body._id;
});

describe('REST — Posts CRUD (Docker MongoDB)', () => {
  // ─────────────────────────────────────────────
  // POST /posts — Create
  // ─────────────────────────────────────────────
  describe('POST /posts', () => {
    it('201 – creates post with title, content and author', async () => {
      const res = await request(app)
        .post(POSTS)
        .send({ title: 'My Post', content: 'Content here', author: authorId });

      expect(res.status).toBe(201);
      expect(res.body._id).toBeDefined();
      expect(res.body.title).toBe('My Post');
      expect(res.body.content).toBe('Content here');
      expect(res.body.createdAt).toBeDefined();
    });

    it('400 – missing title', async () => {
      const res = await request(app).post(POSTS).send({ content: 'X', author: authorId });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – missing content', async () => {
      const res = await request(app).post(POSTS).send({ title: 'T', author: authorId });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – missing author', async () => {
      const res = await request(app).post(POSTS).send({ title: 'T', content: 'C' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – completely empty body', async () => {
      const res = await request(app).post(POSTS).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('500 – duplicate title is not allowed', async () => {
      await request(app).post(POSTS).send({ title: 'Dup', content: 'C1', author: authorId });
      const res = await request(app).post(POSTS).send({ title: 'Dup', content: 'C2', author: authorId });
      expect(res.status).toBe(500);
      expect(res.body.message).toContain('Post with this title already exists!');
    });

    it('returns complete data of the created post', async () => {
      const res = await request(app)
        .post(POSTS)
        .send({ title: 'Full Fields', content: 'Body here', author: authorId });
      const { body } = res;
      expect(body).toHaveProperty('_id');
      expect(body).toHaveProperty('title', 'Full Fields');
      expect(body).toHaveProperty('content', 'Body here');
      expect(body).toHaveProperty('createdAt');
    });
  });

  // ─────────────────────────────────────────────
  // GET /posts — List all
  // ─────────────────────────────────────────────
  describe('GET /posts', () => {
    it('200 – returns empty list when there are no posts', async () => {
      const res = await request(app).get(POSTS);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('200 – returns all posts', async () => {
      await request(app).post(POSTS).send({ title: 'P1', content: 'C1', author: authorId });
      await request(app).post(POSTS).send({ title: 'P2', content: 'C2', author: authorId });

      const res = await request(app).get(POSTS);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('author is populated with user data', async () => {
      await request(app).post(POSTS).send({ title: 'Pop Post', content: 'C', author: authorId });
      const res = await request(app).get(POSTS);
      const [post] = res.body;
      expect(post.author).toMatchObject({ username: 'author_user' });
      expect(post.author._id).toBe(authorId);
    });

    it('posts have complete fields', async () => {
      await request(app).post(POSTS).send({ title: 'Fields Test', content: 'Body', author: authorId });
      const res = await request(app).get(POSTS);
      const [post] = res.body;
      expect(post).toHaveProperty('_id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('author');
      expect(post).toHaveProperty('createdAt');
    });
  });

  // ─────────────────────────────────────────────
  // GET /posts/:id — Find by ID
  // ─────────────────────────────────────────────
  describe('GET /posts/:id', () => {
    it('200 – returns post by ID with populated author', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'By ID Post', content: 'Content', author: authorId });

      const res = await request(app).get(`${POSTS}/${created.body._id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('By ID Post');
      expect(res.body.author._id).toBe(authorId);
    });

    it('404 – non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`${POSTS}/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('500 – invalid ID (not ObjectId)', async () => {
      const res = await request(app).get(`${POSTS}/invalid-id`);
      expect(res.status).toBe(500);
    });

    it('post fields are complete', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Full Post', content: 'Full Content', author: authorId });

      const res = await request(app).get(`${POSTS}/${created.body._id}`);
      expect(res.body).toHaveProperty('_id', created.body._id);
      expect(res.body).toHaveProperty('title', 'Full Post');
      expect(res.body).toHaveProperty('content', 'Full Content');
      expect(res.body.author).toMatchObject({ name: 'Author', username: 'author_user' });
    });
  });

  // ─────────────────────────────────────────────
  // GET /posts/user/:id — Find by User (CRITICAL – ordering fix)
  // ─────────────────────────────────────────────
  describe('GET /posts/user/:id', () => {
    it('200 – returns user posts', async () => {
      await request(app).post(POSTS).send({ title: 'Post A', content: 'C', author: authorId });
      await request(app).post(POSTS).send({ title: 'Post B', content: 'C', author: authorId });

      const res = await request(app).get(`${POSTS}/user/${authorId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].author._id).toBe(authorId);
    });

    it('200 – returns [] when user has no posts', async () => {
      const otherUser = await request(app)
        .post(USERS)
        .send({ name: 'No Posts', username: 'noposts' });

      const res = await request(app).get(`${POSTS}/user/${otherUser.body._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('does NOT conflict with GET /posts/:id (correct route is reached)', async () => {
      // Verifies that the word "user" is not interpreted as a post :id
      const res = await request(app).get(`${POSTS}/user/${authorId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('returned posts belong only to the requested user', async () => {
      const otherUser = await request(app)
        .post(USERS)
        .send({ name: 'Other', username: 'other_u' });

      await request(app).post(POSTS).send({ title: 'My Post', content: 'C', author: authorId });
      await request(app).post(POSTS).send({ title: 'Other Post', content: 'C', author: otherUser.body._id });

      const res = await request(app).get(`${POSTS}/user/${authorId}`);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('My Post');
    });

    it('author is populated in posts by user', async () => {
      await request(app).post(POSTS).send({ title: 'Pop by User', content: 'C', author: authorId });
      const res = await request(app).get(`${POSTS}/user/${authorId}`);
      expect(res.body[0].author).toMatchObject({ username: 'author_user' });
    });
  });

  // ─────────────────────────────────────────────
  // PUT /posts/:id — Update
  // ─────────────────────────────────────────────
  describe('PUT /posts/:id', () => {
    it('200 – updates title', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Old Title', content: 'Old Content', author: authorId });

      const res = await request(app)
        .put(`${POSTS}/${created.body._id}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title');
      expect(res.body.content).toBe('Old Content');
    });

    it('200 – updates content', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Title X', content: 'Old Body', author: authorId });

      const res = await request(app)
        .put(`${POSTS}/${created.body._id}`)
        .send({ content: 'New Body' });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('New Body');
      expect(res.body.title).toBe('Title X');
    });

    it('200 – updates title and content together', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Old T', content: 'Old C', author: authorId });

      const res = await request(app)
        .put(`${POSTS}/${created.body._id}`)
        .send({ title: 'New T', content: 'New C' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'New T', content: 'New C' });
    });

    it('400 – empty body (no title or content)', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).put(`${POSTS}/${fakeId}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('404 – non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).put(`${POSTS}/${fakeId}`).send({ title: 'Ghost' });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('data persists after update (GET confirms)', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Before', content: 'Before body', author: authorId });

      await request(app).put(`${POSTS}/${created.body._id}`).send({ title: 'After' });

      const res = await request(app).get(`${POSTS}/${created.body._id}`);
      expect(res.body.title).toBe('After');
      expect(res.body.content).toBe('Before body');
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /posts/:id — Delete
  // ─────────────────────────────────────────────
  describe('DELETE /posts/:id', () => {
    it('204 – deletes existing post', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Delete Me', content: 'C', author: authorId });

      const res = await request(app).delete(`${POSTS}/${created.body._id}`);
      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('404 – non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`${POSTS}/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Post not found');
    });

    it('post is gone after delete (GET returns 404)', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Phantom Post', content: 'C', author: authorId });

      await request(app).delete(`${POSTS}/${created.body._id}`);

      const res = await request(app).get(`${POSTS}/${created.body._id}`);
      expect(res.status).toBe(404);
    });

    it('cannot delete the same post twice', async () => {
      const created = await request(app)
        .post(POSTS)
        .send({ title: 'Double Del', content: 'C', author: authorId });

      await request(app).delete(`${POSTS}/${created.body._id}`);
      const res = await request(app).delete(`${POSTS}/${created.body._id}`);
      expect(res.status).toBe(404);
    });

    it('post list decreases after delete', async () => {
      const p1 = await request(app).post(POSTS).send({ title: 'Keep Me', content: 'C', author: authorId });
      const p2 = await request(app).post(POSTS).send({ title: 'Del Me', content: 'C', author: authorId });

      await request(app).delete(`${POSTS}/${p2.body._id}`);

      const res = await request(app).get(POSTS);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]._id).toBe(p1.body._id);
    });
  });
});
