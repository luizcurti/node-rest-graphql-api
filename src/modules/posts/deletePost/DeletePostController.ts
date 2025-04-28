import { Request, Response } from 'express';
import { DeletePostService } from './DeletePostService';

class DeletePostController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const deletePostService = new DeletePostService();

      await deletePostService.execute(id);

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Post not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { DeletePostController };
