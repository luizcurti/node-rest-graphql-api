/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server';

let mongoServer: MongoMemoryServer;
let userId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.keys(collections).map((key) => collections[key].deleteMany({})),
  );
  // Create a user to use as author in post tests
  const userRes = await request(app)
    .post('/users')
    .send({ name: 'Author User', username: 'authoruser' });
  // eslint-disable-next-line no-underscore-dangle
  userId = userRes.body._id;
});

describe('REST API - Posts', () => {
  describe('POST /posts', () => {
    it('should create a post and return 201', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'My First Post', content: 'Hello World', author: userId });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ title: 'My First Post', content: 'Hello World' });
      expect(res.body._id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ content: 'Hello World', author: userId });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Validation failed' });
    });

    it('should return 400 when content is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'My Post', author: userId });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Validation failed' });
    });

    it('should return 400 when author is missing', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'My Post', content: 'Hello World' });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Validation failed' });
    });

    it('should return 500 when title already exists', async () => {
      await request(app)
        .post('/posts')
        .send({ title: 'Duplicate Title', content: 'First', author: userId });

      const res = await request(app)
        .post('/posts')
        .send({ title: 'Duplicate Title', content: 'Second', author: userId });

      expect(res.status).toBe(500);
      expect(res.body.message).toContain('Post with this title already exists!');
    });
  });

  describe('GET /posts', () => {
    it('should return 200 with empty array when no posts exist', async () => {
      const res = await request(app).get('/posts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return 200 with list of posts populated with author', async () => {
      await request(app)
        .post('/posts')
        .send({ title: 'Post One', content: 'Content 1', author: userId });
      await request(app)
        .post('/posts')
        .send({ title: 'Post Two', content: 'Content 2', author: userId });

      const res = await request(app).get('/posts');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].author).toMatchObject({ username: 'authoruser' });
    });
  });

  describe('GET /posts/:id', () => {
    it('should return post by id with 200', async () => {
      const created = await request(app)
        .post('/posts')
        .send({ title: 'Specific Post', content: 'Content', author: userId });

      const res = await request(app).get(`/posts/${created.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'Specific Post', content: 'Content' });
      expect(res.body.author).toMatchObject({ _id: userId });
    });

    it('should return 404 when post not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/posts/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: 'Post not found' });
    });

    it('should return 500 for invalid id format', async () => {
      const res = await request(app).get('/posts/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /posts/user/:id', () => {
    it('should return posts by user with 200', async () => {
      await request(app)
        .post('/posts')
        .send({ title: 'User Post 1', content: 'Content 1', author: userId });
      await request(app)
        .post('/posts')
        .send({ title: 'User Post 2', content: 'Content 2', author: userId });

      const res = await request(app).get(`/posts/user/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].author._id).toBe(userId);
    });

    it('should return 200 with empty array when user has no posts', async () => {
      const anotherUser = await request(app)
        .post('/users')
        .send({ name: 'No Posts User', username: 'noposts' });

      const res = await request(app).get(`/posts/user/${anotherUser.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should NOT match /posts/:id route (route ordering test)', async () => {
      // This verifies the fix: /posts/user/:id is correctly matched before /posts/:id
      const res = await request(app).get(`/posts/user/${userId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update post title and return 200', async () => {
      const created = await request(app)
        .post('/posts')
        .send({ title: 'Old Title', content: 'Old Content', author: userId });

      const res = await request(app)
        .put(`/posts/${created.body._id}`)
        .send({ title: 'New Title' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'New Title', content: 'Old Content' });
    });

    it('should update post content and return 200', async () => {
      const created = await request(app)
        .post('/posts')
        .send({ title: 'My Title', content: 'Old Content', author: userId });

      const res = await request(app)
        .put(`/posts/${created.body._id}`)
        .send({ content: 'New Content' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'My Title', content: 'New Content' });
    });

    it('should return 400 when neither title nor content provided', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/posts/${fakeId}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: 'Validation failed: Missing required fields.' });
    });

    it('should return 404 when post not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/posts/${fakeId}`)
        .send({ title: 'Ghost Post' });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: 'Post not found' });
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete post and return 204', async () => {
      const created = await request(app)
        .post('/posts')
        .send({ title: 'To Delete', content: 'Content', author: userId });

      const res = await request(app).delete(`/posts/${created.body._id}`);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('should return 404 when post not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/posts/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: 'Post not found' });
    });

    it('should confirm post no longer exists after delete', async () => {
      const created = await request(app)
        .post('/posts')
        .send({ title: 'To Delete', content: 'Content', author: userId });

      await request(app).delete(`/posts/${created.body._id}`);

      const res = await request(app).get(`/posts/${created.body._id}`);
      expect(res.status).toBe(404);
    });
  });
});
