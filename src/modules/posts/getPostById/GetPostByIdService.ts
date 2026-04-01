import { Post } from '@models/Post';

class GetPostByIdService {
  async execute(id: string) {
    const post = await Post.findById(id).populate('author').exec();

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }
}

export { GetPostByIdService };
