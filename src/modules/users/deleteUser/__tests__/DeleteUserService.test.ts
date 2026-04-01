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
    const mockFindByIdAndDelete = jest.fn().mockResolvedValue({ id: userId });
    User.findByIdAndDelete = mockFindByIdAndDelete;

    await deleteUserService.execute(userId);

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(userId);
  });

  it('should throw an error if the user is not found', async () => {
    const userId = '1';
    const mockFindByIdAndDelete = jest.fn().mockResolvedValue(null);
    User.findByIdAndDelete = mockFindByIdAndDelete;

    await expect(deleteUserService.execute(userId)).rejects.toThrow('User not found');

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(userId);
  });
});
