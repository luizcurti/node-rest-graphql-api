import { User } from '@models/User';
import { GetUsersService } from '../GetUsersService';

jest.mock('@models/User');

describe('GetUsersService', () => {
  let getUsersService: GetUsersService;

  beforeEach(() => {
    getUsersService = new GetUsersService();
    jest.clearAllMocks();
  });

  it('should return a list of users', async () => {
    const mockUsers = [
      { id: '1', name: 'User One', email: 'user1@example.com' },
      { id: '2', name: 'User Two', email: 'user2@example.com' },
    ];
    (User.find as jest.Mock).mockResolvedValue(mockUsers);

    const users = await getUsersService.execute();

    expect(users).toEqual(mockUsers);
    expect(User.find).toHaveBeenCalled();
  });

  it('should return empty array when no users exist', async () => {
    (User.find as jest.Mock).mockResolvedValue([]);

    const users = await getUsersService.execute();

    expect(users).toEqual([]);
    expect(User.find).toHaveBeenCalled();
  });
});
