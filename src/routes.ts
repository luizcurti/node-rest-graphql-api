import { CreateUserController } from '@modules/users/createUser/CreateUserController';
import { GetUsersController } from '@modules/users/getUsers/GetUsersController';
import { GetUserByIdController } from '@modules/users/getUserById/GetUserByIdController';
import { UpdateUserController } from '@modules/users/updateUser/UpdateUserController';
import { DeleteUserController } from '@modules/users/deleteUser/DeleteUserController';
import { CreatePostController } from '@modules/posts/createPost/CreatePostController';
import { GetPostByIdController } from '@modules/posts/getPostById/GetPostByIdController';
import { UpdatePostController } from '@modules/posts/updatePost/UpdatePostController';
import { DeletePostController } from '@modules/posts/deletePost/DeletePostController';
import { GetPostsController } from '@modules/posts/getPosts/GetPostsController';
import { GetPostsByUserController } from '@modules/posts/getPostsByUser/GetPostsByUserController';

import { Router } from 'express';

const routes = Router();

const createUserController = new CreateUserController();
const getUsersController = new GetUsersController();
const getUserByIdController = new GetUserByIdController();
const updateUserController = new UpdateUserController();
const deleteUserController = new DeleteUserController();

const createPostController = new CreatePostController();
const getPostByIdController = new GetPostByIdController();
const updatePostController = new UpdatePostController();
const deletePostController = new DeletePostController();
const getPostsController = new GetPostsController();
const getPostsByUserController = new GetPostsByUserController();

routes.post('/users', createUserController.handle);
routes.get('/users', getUsersController.handle);
routes.get('/users/:id', getUserByIdController.handle);
routes.put('/users/:id', updateUserController.handle);
routes.delete('/users/:id', deleteUserController.handle);

routes.post('/posts', createPostController.handle);
routes.get('/posts', getPostsController.handle);
routes.get('/posts/:id', getPostByIdController.handle);
routes.put('/posts/:id', updatePostController.handle);
routes.delete('/posts/:id', deletePostController.handle);
routes.get('/posts/user/:id', getPostsByUserController.handle);

export { routes };
