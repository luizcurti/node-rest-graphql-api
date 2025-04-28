import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import path from 'path';

export function getResolvers() {
  try {
    const resolversArray = loadFilesSync(path.join(__dirname, './resolvers/*.ts'));
    const mergedResolvers = mergeResolvers(resolversArray);
    return mergedResolvers;
  } catch (err) {
    console.error('Erro ao carregar os resolvers:', err);
    throw err;
  }
}
