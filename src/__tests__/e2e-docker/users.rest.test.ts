/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../server';
import { setupTestDB } from './dbHelper';

setupTestDB();

const BASE = '/users';

describe('REST — Users CRUD (Docker MongoDB)', () => {
  // ─────────────────────────────────────────────
  // POST /users — Create
  // ─────────────────────────────────────────────
  describe('POST /users', () => {
    it('201 – creates user with name and username', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ name: 'Alice', username: 'alice' });

      expect(res.status).toBe(201);
      expect(res.body._id).toBeDefined();
      expect(res.body.name).toBe('Alice');
      expect(res.body.username).toBe('alice');
      expect(res.body.createdAt).toBeDefined();
    });

    it('400 – missing name', async () => {
      const res = await request(app).post(BASE).send({ username: 'alice' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – missing username', async () => {
      const res = await request(app).post(BASE).send({ name: 'Alice' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – empty body', async () => {
      const res = await request(app).post(BASE).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('400 – duplicate username', async () => {
      await request(app).post(BASE).send({ name: 'Alice', username: 'alice' });
      const res = await request(app).post(BASE).send({ name: 'Other', username: 'alice' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists!');
    });

    it('returns complete data of the created user', async () => {
      const res = await request(app)
        .post(BASE)
        .send({ name: 'Bob', username: 'bob123' });
      expect(res.body).toMatchObject({
        name: 'Bob',
        username: 'bob123',
      });
      expect(typeof res.body._id).toBe('string');
    });
  });

  // ─────────────────────────────────────────────
  // GET /users — List
  // ─────────────────────────────────────────────
  describe('GET /users', () => {
    it('200 – returns empty list when there are no users', async () => {
      const res = await request(app).get(BASE);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('200 – returns all created users', async () => {
      await request(app).post(BASE).send({ name: 'Alice', username: 'alice' });
      await request(app).post(BASE).send({ name: 'Bob', username: 'bob' });

      const res = await request(app).get(BASE);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      const usernames = res.body.map((u: { username: string }) => u.username);
      expect(usernames).toContain('alice');
      expect(usernames).toContain('bob');
    });

    it('returned users have the correct fields', async () => {
      await request(app).post(BASE).send({ name: 'Carol', username: 'carol' });
      const res = await request(app).get(BASE);
      const [user] = res.body;
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('createdAt');
    });
  });

  // ─────────────────────────────────────────────
  // GET /users/:id — Find by ID
  // ─────────────────────────────────────────────
  describe('GET /users/:id', () => {
    it('200 – returns user by ID', async () => {
      const created = await request(app).post(BASE).send({ name: 'Dan', username: 'dan' });
      const res = await request(app).get(`${BASE}/${created.body._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Dan', username: 'dan' });
    });

    it('404 – non-existent ID returns not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`${BASE}/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('500 – invalid ID (not ObjectId) returns 500', async () => {
      const res = await request(app).get(`${BASE}/not-a-valid-id`);
      expect(res.status).toBe(500);
    });

    it('returned fields are complete', async () => {
      const created = await request(app).post(BASE).send({ name: 'Eve', username: 'eve' });
      const res = await request(app).get(`${BASE}/${created.body._id}`);
      expect(res.body).toHaveProperty('_id', created.body._id);
      expect(res.body).toHaveProperty('name', 'Eve');
      expect(res.body).toHaveProperty('username', 'eve');
      expect(res.body).toHaveProperty('createdAt');
    });
  });

  // ─────────────────────────────────────────────
  // PUT /users/:id — Update
  // ─────────────────────────────────────────────
  describe('PUT /users/:id', () => {
    it('200 – updates name', async () => {
      const created = await request(app).post(BASE).send({ name: 'Old Name', username: 'user1' });
      const res = await request(app).put(`${BASE}/${created.body._id}`).send({ name: 'New Name' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.username).toBe('user1');
    });

    it('200 – updates username', async () => {
      const created = await request(app).post(BASE).send({ name: 'Fulano', username: 'old_user' });
      const res = await request(app).put(`${BASE}/${created.body._id}`).send({ username: 'new_user' });
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('new_user');
      expect(res.body.name).toBe('Fulano');
    });

    it('200 – updates name and username together', async () => {
      const created = await request(app).post(BASE).send({ name: 'Old', username: 'old' });
      const res = await request(app)
        .put(`${BASE}/${created.body._id}`)
        .send({ name: 'New', username: 'new_username' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'New', username: 'new_username' });
    });

    it('400 – empty body (no name or username)', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).put(`${BASE}/${fakeId}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation failed');
    });

    it('400 – id missing in route + no body', async () => {
      const res = await request(app).put(`${BASE}/`).send({});
      // Route does not exist (Express returns 404)
      expect([400, 404]).toContain(res.status);
    });

    it('404 – valid but non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).put(`${BASE}/${fakeId}`).send({ name: 'Ghost' });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('data persists after update (GET confirms)', async () => {
      const created = await request(app).post(BASE).send({ name: 'Before', username: 'before' });
      await request(app).put(`${BASE}/${created.body._id}`).send({ name: 'After' });
      const res = await request(app).get(`${BASE}/${created.body._id}`);
      expect(res.body.name).toBe('After');
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /users/:id — Delete
  // ─────────────────────────────────────────────
  describe('DELETE /users/:id', () => {
    it('204 – deletes existing user', async () => {
      const created = await request(app).post(BASE).send({ name: 'ToDelete', username: 'todelete' });
      const res = await request(app).delete(`${BASE}/${created.body._id}`);
      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('404 – non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`${BASE}/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });

    it('user is truly gone after delete (GET returns 404)', async () => {
      const created = await request(app).post(BASE).send({ name: 'Phantom', username: 'phantom' });
      await request(app).delete(`${BASE}/${created.body._id}`);
      const res = await request(app).get(`${BASE}/${created.body._id}`);
      expect(res.status).toBe(404);
    });

    it('cannot delete the same user twice', async () => {
      const created = await request(app).post(BASE).send({ name: 'Double', username: 'double' });
      await request(app).delete(`${BASE}/${created.body._id}`);
      const res = await request(app).delete(`${BASE}/${created.body._id}`);
      expect(res.status).toBe(404);
    });

    it('user list decreases after delete', async () => {
      await request(app).post(BASE).send({ name: 'A', username: 'a_user' });
      const b = await request(app).post(BASE).send({ name: 'B', username: 'b_user' });
      await request(app).delete(`${BASE}/${b.body._id}`);
      const res = await request(app).get(BASE);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].username).toBe('a_user');
    });
  });
});
