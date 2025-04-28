import { Request, Response } from 'express';
import { CreatePostService } from './CreatePostService';

class CreatePostController {
  async handle(req: Request, res: Response) {
    try {
      const { title, content, author } = req.body;

      if (!title || !content || !author) {
        return res.status(400).json({ error: 'Validation failed' });
      }

      const createPostService = new CreatePostService();

      const post = await createPostService.execute({
        title,
        content,
        author,
      });

      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { CreatePostController };
