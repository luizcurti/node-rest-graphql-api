import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import path from 'path';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadFilesSync } from '@graphql-tools/load-files';
import { routes } from './routes';
import { getResolvers } from './resolvers';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/code_drops';

const app = express();

const typeDefs = loadFilesSync(path.join(__dirname, './schemas/*.graphql'));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: getResolvers(),
});

app.use(express.json());
app.use(routes);

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof Error) {
    return response.status(400).json({ error: error.message });
  }
  return response.status(500).json({ error: 'Internal server error' });
});

export { app };

if (require.main === module) {
  mongoose.connect(MONGO_URI).then(() => {
    app.listen(4003, () => console.log('Server is running'));
  });
}
