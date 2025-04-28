import { User } from '@models/User';
import { GetUserByIdService } from '../GetUserByIdService';

jest.mock('@models/User');

describe('GetUserByIdService', () => {
  let getUserByIdService: GetUserByIdService;

  beforeEach(() => {
    jest.clearAllMocks();
    getUserByIdService = new GetUserByIdService();
  });

  it('should return a user when found', async () => {
    const mockUser = { id: '123', name: 'John Doe', email: 'john@example.com' };
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    const user = await getUserByIdService.execute('123');

    expect(user).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith('123');
  });

  it('should throw an error when user is not found', async () => {
    (User.findById as jest.Mock).mockResolvedValue(null);

    await expect(getUserByIdService.execute('non-existent-id')).rejects.toThrow('User not found');
    expect(User.findById).toHaveBeenCalledWith('non-existent-id');
  });
});
