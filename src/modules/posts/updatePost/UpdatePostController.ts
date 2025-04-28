import { Request, Response } from 'express';
import { UpdatePostService } from './UpdatePostService';

class UpdatePostController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      if (!id || (!title && !content)) {
        return res.status(400).json({ message: 'Validation failed: Missing required fields.' });
      }

      const updatePostService = new UpdatePostService();
      const post = await updatePostService.execute({ id, title, content });

      return res.status(200).json(post);
    } catch (error) {
      if (error.message === 'Post not found') {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { UpdatePostController };
