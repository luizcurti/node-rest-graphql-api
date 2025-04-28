import { makeExecutableSchema } from '@graphql-tools/schema';
import path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';

const typeDefs = loadFilesSync(path.join(__dirname, './schemas/*.graphql'));
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers/*.ts'));
const resolvers = mergeResolvers(resolversArray);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
export default schema;
