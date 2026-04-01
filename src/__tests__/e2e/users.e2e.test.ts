/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../../server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.keys(collections).map((key) => collections[key].deleteMany({})),
  );
});

describe('REST API - Users', () => {
  describe('POST /users', () => {
    it('should create a user and return 201', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'John Doe', username: 'johndoe' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'John Doe', username: 'johndoe' });
      expect(res.body._id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ username: 'johndoe' });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Validation failed' });
    });

    it('should return 400 when username is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ name: 'John Doe' });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Validation failed' });
    });

    it('should return 400 when user already exists', async () => {
      await request(app).post('/users').send({ name: 'John', username: 'johndoe' });

      const res = await request(app)
        .post('/users')
        .send({ name: 'Jane', username: 'johndoe' });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'User already exists!' });
    });
  });

  describe('GET /users', () => {
    it('should return 200 with empty array when no users exist', async () => {
      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return 200 with list of users', async () => {
      await request(app).post('/users').send({ name: 'Alice', username: 'alice' });
      await request(app).post('/users').send({ name: 'Bob', username: 'bob' });

      const res = await request(app).get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ name: 'Alice', username: 'alice' });
      expect(res.body[1]).toMatchObject({ name: 'Bob', username: 'bob' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id with 200', async () => {
      const created = await request(app)
        .post('/users')
        .send({ name: 'Alice', username: 'alice' });

      const res = await request(app).get(`/users/${created.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Alice', username: 'alice' });
    });

    it('should return 404 when user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/users/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: 'User not found' });
    });

    it('should return 500 for invalid id format', async () => {
      const res = await request(app).get('/users/invalid-id');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user name and return 200', async () => {
      const created = await request(app)
        .post('/users')
        .send({ name: 'Alice', username: 'alice' });

      const res = await request(app)
        .put(`/users/${created.body._id}`)
        .send({ name: 'Alice Updated' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Alice Updated', username: 'alice' });
    });

    it('should update user username and return 200', async () => {
      const created = await request(app)
        .post('/users')
        .send({ name: 'Alice', username: 'alice' });

      const res = await request(app)
        .put(`/users/${created.body._id}`)
        .send({ username: 'alice_new' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Alice', username: 'alice_new' });
    });

    it('should return 400 when no fields provided', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/users/${fakeId}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ message: 'Validation failed: Missing required fields.' });
    });

    it('should return 404 when user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .put(`/users/${fakeId}`)
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: 'User not found' });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user and return 204', async () => {
      const created = await request(app)
        .post('/users')
        .send({ name: 'Alice', username: 'alice' });

      const res = await request(app).delete(`/users/${created.body._id}`);

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('should return 404 when user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/users/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ message: 'User not found' });
    });

    it('should confirm user no longer exists after delete', async () => {
      const created = await request(app)
        .post('/users')
        .send({ name: 'Alice', username: 'alice' });

      await request(app).delete(`/users/${created.body._id}`);

      const res = await request(app).get(`/users/${created.body._id}`);
      expect(res.status).toBe(404);
    });
  });
});
