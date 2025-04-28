import { Post } from '@models/Post';

class GetPostsByUserService {
  async execute(id: string) {
    const posts = await Post.find({ author: id })
      .populate('author')
      .exec();

    return posts;
  }
}

export { GetPostsByUserService };
