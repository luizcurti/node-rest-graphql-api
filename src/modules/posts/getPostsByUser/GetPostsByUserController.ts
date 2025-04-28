import { Request, Response } from 'express';
import { GetPostsByUserService } from './GetPostsByUserService';

class GetPostsByUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const getPostsByUserService = new GetPostsByUserService();
      const posts = await getPostsByUserService.execute(id);

      if (posts.length === 0) {
        return res.status(404).json({ message: 'No posts found' });
      }

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { GetPostsByUserController };
