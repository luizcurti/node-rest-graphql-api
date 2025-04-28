import { Post } from '@models/Post';

class GetPostByIdService {
  async execute(id: string) {
    const post = await Post.findById(id).populate('author').exec();

    return post;
  }
}

export { GetPostByIdService };
