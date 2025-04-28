import { Request, Response } from 'express';
import { GetPostsService } from './GetPostsService';

class GetPostsController {
  async handle(req: Request, res: Response) {
    try {
      const getPostsService = new GetPostsService();
      const posts = await getPostsService.execute();

      if (posts.length === 0) {
        return res.status(404).json({ message: 'No posts found' });
      }

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { GetPostsController };
