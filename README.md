# Node.js REST + GraphQL API

A Node.js backend API that exposes both a REST and a GraphQL interface for managing **Users** and **Posts**. Built with Express, Mongoose, and TypeScript, following a modular architecture with one file per use case.

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** — data storage
- **GraphQL** via `express-graphql` + `@graphql-tools/schema`
- **Jest** + **ts-jest** — unit and E2E testing
- **Supertest** — HTTP testing
- **mongodb-memory-server** — in-memory MongoDB for fast tests
- **Docker Compose** — real MongoDB for E2E tests
- **ESLint** (airbnb-base) — code linting

## Prerequisites

- Node.js >= 18.0.0
- Docker (for E2E tests against a real MongoDB instance)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/luizcurti/node-rest-graphql-api.git
cd node-rest-graphql-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The server starts at **http://localhost:4003**.

## REST API Endpoints

### Users

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/users` | Create a user |
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by ID |
| `PUT` | `/users/:id` | Update a user |
| `DELETE` | `/users/:id` | Delete a user |

### Posts

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/posts` | Create a post |
| `GET` | `/posts` | List all posts |
| `GET` | `/posts/:id` | Get post by ID |
| `GET` | `/posts/user/:id` | Get all posts by a user |
| `PUT` | `/posts/:id` | Update a post |
| `DELETE` | `/posts/:id` | Delete a post |

## GraphQL API

The GraphQL endpoint is available at **http://localhost:4003/graphql**.

### Queries
- `getAllUsers` — list all users
- `getUserById(id)` — get user by ID
- `getAllPosts` — list all posts
- `getPostById(id)` — get post by ID
- `getPostsByUser(idUser)` — get all posts by a user

### Mutations
- `createUser(input)` — create a user
- `updateUser(id, input)` — update a user
- `deleteUser(id)` — delete a user
- `createPost(input)` — create a post
- `updatePost(id, input)` — update a post
- `deletePost(id)` — delete a post

## Postman Collections

Two Postman collections are available at the root of the project. Import either into Postman to get pre-configured requests:

- `REST API.postman_collection.json` — all 11 REST endpoints
- `graphql_api.postman_collection.json` — all GraphQL queries and mutations

## Running Tests

### Unit tests + in-memory E2E tests
```bash
npm test
```
Runs 26 test suites, 162 tests.

### E2E tests with real Docker MongoDB
```bash
npm run test:e2e
```
Spins up the MongoDB Docker container defined in `docker-compose.yml`, runs 4 test suites (96 tests) against a real database, then tears down the test database.

### Lint
```bash
npm run eslint
```

## Build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs the compiled output
```

