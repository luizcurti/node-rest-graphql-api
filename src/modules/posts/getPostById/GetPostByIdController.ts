import { Request, Response } from 'express';
import { GetPostByIdService } from './GetPostByIdService';

class GetPostByIdController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const getPostByIdService = new GetPostByIdService();
      const post = await getPostByIdService.execute(id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { GetPostByIdController };
