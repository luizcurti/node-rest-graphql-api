import { Post } from '@models/Post';
import { GetPostsService } from '../GetPostsService';

jest.mock('@models/Post');

describe('GetPostsService', () => {
  let service: GetPostsService;

  beforeEach(() => {
    service = new GetPostsService();
    jest.clearAllMocks();
  });

  it('deve retornar todos os posts com o autor populado', async () => {
    const mockPosts = [
      {
        id: '1', title: 'Post 1', content: 'Conteúdo do post 1', author: 'user123',
      },
      {
        id: '2', title: 'Post 2', content: 'Conteúdo do post 2', author: 'user456',
      },
    ];

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPosts);
    (Post.find as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute();

    expect(Post.find).toHaveBeenCalledTimes(1);
    expect(populateMock).toHaveBeenCalledWith('author');
    expect(execMock).toHaveBeenCalled();
    expect(result).toEqual(mockPosts);
  });

  it('deve retornar um array vazio se não houver posts', async () => {
    const mockPosts: unknown[] = [];

    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValue(mockPosts);
    (Post.find as jest.Mock).mockReturnValue({ populate: populateMock, exec: execMock });

    const result = await service.execute();

    expect(result).toEqual([]);
  });

  it('deve lançar erro se a consulta ao banco de dados falhar', async () => {
    (Post.find as jest.Mock).mockImplementation(() => {
      throw new Error('Erro no banco de dados');
    });

    await expect(service.execute()).rejects.toThrow('Erro no banco de dados');
  });
});
