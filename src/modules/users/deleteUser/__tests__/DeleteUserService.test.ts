import { User } from '@models/User';
import { DeleteUserService } from '../DeleteUserService';

jest.mock('@models/User');

describe('DeleteUserService', () => {
  let deleteUserService: DeleteUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    deleteUserService = new DeleteUserService();
  });

  it('should delete a user successfully', async () => {
    const userId = '1';
    const mockFindById = jest.fn().mockResolvedValue({
      id: userId,
      name: 'John Doe',
      username: 'johndoe',
    });
    User.findById = mockFindById;

    const mockFindByIdAndDelete = jest.fn().mockResolvedValue(true);
    User.findByIdAndDelete = mockFindByIdAndDelete;

    await deleteUserService.execute(userId);

    expect(mockFindById).toHaveBeenCalledWith(userId);
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it('should throw an error if the user is not found', async () => {
    const userId = '1';
    const mockFindById = jest.fn().mockResolvedValue(null);
    User.findById = mockFindById;

    await expect(deleteUserService.execute(userId)).rejects.toThrow(
      'User not found',
    );

    expect(mockFindById).toHaveBeenCalledWith(userId);
  });
});
