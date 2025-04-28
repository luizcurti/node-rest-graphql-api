import { Request, Response } from 'express';
import { CreateUserService } from './CreateUserService';

class CreateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { name, username } = req.body;

      if (!name || !username) {
        return res.status(400).json({ error: 'Validation failed' });
      }

      const createUserService = new CreateUserService();
      const user = await createUserService.execute({
        name,
        username,
      });

      return res.status(200).json(user);
    } catch (error) {
      const statusCode = error.message === 'User already exists!' ? 400 : 500;

      return res.status(statusCode).json({ error: error.message || 'Internal server error' });
    }
  }
}

export { CreateUserController };
