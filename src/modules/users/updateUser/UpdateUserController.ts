import { Request, Response } from 'express';
import { UpdateUserService } from './UpdateUserService';

class UpdateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, username } = req.body;

      if (!id && (!name || !username)) {
        return res.status(400).json({ message: 'Validation failed: Missing required fields.' });
      }

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({ id, name, username });

      return res.status(200).json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { UpdateUserController };
