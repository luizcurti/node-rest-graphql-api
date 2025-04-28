import { User } from '@models/User';
import { CreateUserService } from '../CreateUserService';

jest.mock('@models/User');

describe('CreateUserService', () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    createUserService = new CreateUserService();
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    const userDTO = { name: 'John Doe', username: 'johndoe' };

    const mockCreate = jest.fn().mockResolvedValue({
      id: '1',
      ...userDTO,
    });

    User.create = mockCreate;

    const user = await createUserService.execute(userDTO);

    expect(mockCreate).toHaveBeenCalledWith(userDTO);
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('John Doe');
    expect(user.username).toBe('johndoe');
  });

  it('should throw an error if user already exists', async () => {
    const userDTO = { name: 'John Doe', username: 'johndoe' };

    const mockFindOne = jest.fn().mockResolvedValue({
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
    });

    User.findOne = mockFindOne;

    await expect(createUserService.execute(userDTO)).rejects.toThrow(
      'User already exists!',
    );
    expect(mockFindOne).toHaveBeenCalledWith({ username: 'johndoe' });
  });

  it('should call findOne to check if user exists', async () => {
    const userDTO = { name: 'John Doe', username: 'johndoe' };

    const mockFindOne = jest.fn().mockResolvedValue(null);
    User.findOne = mockFindOne;

    const mockCreate = jest.fn().mockResolvedValue({
      id: '1',
      ...userDTO,
    });

    User.create = mockCreate;

    await createUserService.execute(userDTO);

    expect(mockFindOne).toHaveBeenCalledWith({ username: 'johndoe' });
  });
});
