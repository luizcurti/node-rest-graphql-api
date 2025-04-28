import { mergeResolvers } from '@graphql-tools/merge';
import usersResolvers from './users.resolvers';
import postsResolvers from './posts.resolvers';

const resolvers = mergeResolvers([usersResolvers, postsResolvers]);

export default resolvers;
