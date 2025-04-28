import { Post } from '@models/Post';

class GetPostsService {
  async execute() {
    const posts = await Post.find().populate('author').exec();

    return posts;
  }
}

export { GetPostsService };
