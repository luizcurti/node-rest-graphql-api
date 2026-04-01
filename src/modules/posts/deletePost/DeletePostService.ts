import { Post } from '@models/Post';

class DeletePostService {
  async execute(id: string): Promise<void> {
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      throw new Error('Post not found');
    }
  }
}

export { DeletePostService };
