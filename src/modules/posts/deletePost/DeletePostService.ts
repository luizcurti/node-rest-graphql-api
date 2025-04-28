import { Post } from '@models/Post';

class DeletePostService {
  async execute(id: string): Promise<boolean> {
    const post = await Post.findById(id);

    if (!post) {
      throw new Error('Post not found');
    }

    await Post.findByIdAndDelete(id);

    return true;
  }
}

export { DeletePostService };
