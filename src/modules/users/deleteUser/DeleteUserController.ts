import { Request, Response } from 'express';
import { DeleteUserService } from './DeleteUserService';

class DeleteUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleteUserService = new DeleteUserService();

      await deleteUserService.execute(id);

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { DeleteUserController };
