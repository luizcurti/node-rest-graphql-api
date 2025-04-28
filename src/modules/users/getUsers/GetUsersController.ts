import { Request, Response } from 'express';
import { GetUsersService } from './GetUsersService';

class GetUsersController {
  async handle(req: Request, res: Response) {
    try {
      const getUsersService = new GetUsersService();
      const users = await getUsersService.execute();

      return res.status(200).json(users);
    } catch (error) {
      if (error.message === 'Users not found') {
        return res.status(404).json({ message: 'Users not found' });
      }
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

export { GetUsersController };
