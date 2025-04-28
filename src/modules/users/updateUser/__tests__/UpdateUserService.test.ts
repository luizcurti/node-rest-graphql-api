import { User } from '@models/User';
import { UpdateUserService } from '../UpdateUserService';

jest.mock('@models/User');

describe('UpdateUserService', () => {
  let updateUserService: UpdateUserService;

  beforeEach(() => {
    updateUserService = new UpdateUserService();
    jest.clearAllMocks();
  });

  it('should update user successfully', async () => {
    const userId = '1';
    const userDTO = { name: 'John Doe Updated', username: 'johndoe_updated' };

    const mockFindById = jest.fn().mockResolvedValue({
      id: userId,
      name: 'John Doe',
      username: 'johndoe',
      save: jest.fn().mockResolvedValue(true),
    });
    User.findById = mockFindById;

    const user = await updateUserService.execute({ id: userId, ...userDTO });

    expect(mockFindById).toHaveBeenCalledWith(userId);
    expect(user.name).toBe(userDTO.name);
    expect(user.username).toBe(userDTO.username);
  });

  it('should throw an error if user is not found', async () => {
    const userId = '1';

    const mockFindById = jest.fn().mockResolvedValue(null);
    User.findById = mockFindById;

    await expect(updateUserService.execute({ id: userId, name: 'New Name' })).rejects.toThrow(
      'User not found',
    );
  });

  it('should update only the fields provided', async () => {
    const userId = '1';
    const userDTO = { name: 'John Doe Updated' };

    const mockFindById = jest.fn().mockResolvedValue({
      id: userId,
      name: 'John Doe',
      username: 'johndoe',
      save: jest.fn().mockResolvedValue(true),
    });
    User.findById = mockFindById;

    const user = await updateUserService.execute({ id: userId, ...userDTO });

    expect(mockFindById).toHaveBeenCalledWith(userId);
    expect(user.name).toBe(userDTO.name);
    expect(user.username).toBe('johndoe');
  });
});
