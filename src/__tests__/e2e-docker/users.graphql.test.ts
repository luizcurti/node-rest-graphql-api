/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../server';
import { setupTestDB } from './dbHelper';

setupTestDB();

const GQL = '/graphql';

// Helpers for GraphQL requests
const gql = (query: string, variables?: Record<string, unknown>) => request(app)
  .post(GQL)
  .set('Content-Type', 'application/json')
  .send({ query, variables });

describe('GraphQL — Users CRUD (Docker MongoDB)', () => {
  // ─────────────────────────────────────────────
  // Mutation: createUser
  // ─────────────────────────────────────────────
  describe('createUser', () => {
    const CREATE_USER = `
      mutation createUser($input: UserInput!) {
        createUser(input: $input) {
          _id
          name
          username
          createdAt
        }
      }
    `;

    it('creates user and returns complete data', async () => {
      const res = await gql(CREATE_USER, { input: { name: 'Alice', username: 'alice' } });
      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.createUser).toMatchObject({ name: 'Alice', username: 'alice' });
      expect(res.body.data.createUser._id).toBeDefined();
      expect(res.body.data.createUser.createdAt).toBeDefined();
    });

    it('error – missing name', async () => {
      const res = await gql(CREATE_USER, { input: { name: '', username: 'alice' } });
      expect(res.status).toBe(200);
      expect(res.body.errors[0].message).toContain('Validation failed');
    });

    it('error – missing username', async () => {
      const res = await gql(CREATE_USER, { input: { name: 'Alice', username: '' } });
      expect(res.status).toBe(200);
      expect(res.body.errors[0].message).toContain('Validation failed');
    });

    it('error – duplicate username', async () => {
      await gql(CREATE_USER, { input: { name: 'Alice', username: 'dup_user' } });
      const res = await gql(CREATE_USER, { input: { name: 'Other', username: 'dup_user' } });
      expect(res.body.errors[0].message).toBe('User already exists!');
    });
  });

  // ─────────────────────────────────────────────
  // Query: getAllUsers
  // ─────────────────────────────────────────────
  describe('getAllUsers', () => {
    const GET_ALL_USERS = `
      query {
        getAllUsers {
          _id
          name
          username
          createdAt
        }
      }
    `;

    const CREATE_USER = `
      mutation createUser($input: UserInput!) {
        createUser(input: $input) { _id name username }
      }
    `;

    it('returns list of created users', async () => {
      await gql(CREATE_USER, { input: { name: 'Alice', username: 'alice' } });
      await gql(CREATE_USER, { input: { name: 'Bob', username: 'bob' } });

      const res = await gql(GET_ALL_USERS);
      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.getAllUsers).toHaveLength(2);
    });

    it('each user has the correct fields', async () => {
      await gql(CREATE_USER, { input: { name: 'Carol', username: 'carol' } });
      const res = await gql(GET_ALL_USERS);
      const [user] = res.body.data.getAllUsers;
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('createdAt');
    });
  });

  // ─────────────────────────────────────────────
  // Query: getUserById
  // ─────────────────────────────────────────────
  describe('getUserById', () => {
    const CREATE_USER = `
      mutation createUser($input: UserInput!) {
        createUser(input: $input) { _id name username }
      }
    `;

    const GET_USER_BY_ID = `
      query getUserById($id: ID!) {
        getUserById(id: $id) {
          _id
          name
          username
          createdAt
        }
      }
    `;

    it('returns user by ID', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'Dan', username: 'dan' } });
      const { _id } = created.body.data.createUser;

      const res = await gql(GET_USER_BY_ID, { id: _id });
      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.getUserById).toMatchObject({ name: 'Dan', username: 'dan' });
    });

    it('error – ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await gql(GET_USER_BY_ID, { id: fakeId });
      expect(res.body.errors[0].message).toBe('User not found');
    });
  });

  // ─────────────────────────────────────────────
  // Mutation: updateUser
  // ─────────────────────────────────────────────
  describe('updateUser', () => {
    const CREATE_USER = `
      mutation createUser($input: UserInput!) {
        createUser(input: $input) { _id }
      }
    `;

    const UPDATE_USER = `
      mutation updateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          _id
          name
          username
        }
      }
    `;

    it('updates name', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'Old', username: 'upd_user' } });
      const { _id } = created.body.data.createUser;

      const res = await gql(UPDATE_USER, { id: _id, input: { name: 'New Name' } });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.updateUser.name).toBe('New Name');
      expect(res.body.data.updateUser.username).toBe('upd_user');
    });

    it('updates username', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'Fixed', username: 'old_username' } });
      const { _id } = created.body.data.createUser;

      const res = await gql(UPDATE_USER, { id: _id, input: { username: 'new_username' } });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.updateUser.username).toBe('new_username');
    });

    it('updates name and username together', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'A', username: 'a_upd' } });
      const { _id } = created.body.data.createUser;

      const res = await gql(UPDATE_USER, { id: _id, input: { name: 'B', username: 'b_upd' } });
      expect(res.body.data.updateUser).toMatchObject({ name: 'B', username: 'b_upd' });
    });

    it('error – ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await gql(UPDATE_USER, { id: fakeId, input: { name: 'Ghost' } });
      expect(res.body.errors[0].message).toBe('User not found');
    });

    it('error – no fields in input', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'Valid', username: 'valid_upd' } });
      const { _id } = created.body.data.createUser;
      const res = await gql(UPDATE_USER, { id: _id, input: {} });
      expect(res.body.errors[0].message).toContain('Validation failed');
    });
  });

  // ─────────────────────────────────────────────
  // Mutation: deleteUser
  // ─────────────────────────────────────────────
  describe('deleteUser', () => {
    const CREATE_USER = `
      mutation createUser($input: UserInput!) {
        createUser(input: $input) { _id }
      }
    `;

    const DELETE_USER = `
      mutation deleteUser($id: ID!) {
        deleteUser(id: $id)
      }
    `;

    const GET_USER_BY_ID = `
      query getUserById($id: ID!) {
        getUserById(id: $id) { _id }
      }
    `;

    it('deletes user and returns true', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'ToDelete', username: 'del_user' } });
      const { _id } = created.body.data.createUser;

      const res = await gql(DELETE_USER, { id: _id });
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.deleteUser).toBe(true);
    });

    it('user no longer exists after delete', async () => {
      const created = await gql(CREATE_USER, { input: { name: 'Gone', username: 'gone_user' } });
      const { _id } = created.body.data.createUser;
      await gql(DELETE_USER, { id: _id });

      const res = await gql(GET_USER_BY_ID, { id: _id });
      expect(res.body.errors[0].message).toBe('User not found');
    });

    it('error – ID not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await gql(DELETE_USER, { id: fakeId });
      expect(res.body.errors[0].message).toBe('User not found');
    });
  });
});
