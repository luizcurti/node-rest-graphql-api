import { Request, Response } from 'express';
import { GetUserByIdService } from './GetUserByIdService';

class GetUserByIdController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const getUserByIdService = new GetUserByIdService();

      const user = await getUserByIdService.execute(id);

      return res.status(200).json(user);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { GetUserByIdController };
