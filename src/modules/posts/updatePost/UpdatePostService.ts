import { Post } from '@models/Post';

interface UpdatePostDTO {
  id: string;
  title?: string;
  content?: string;
}

class UpdatePostService {
  async execute({ id, title, content }: UpdatePostDTO) {
    const post = await Post.findById(id);

    if (!post) {
      throw new Error('Post not found');
    }

    let isUpdated = false;

    if (title) {
      post.title = title;
      isUpdated = true;
    }
    if (content) {
      post.content = content;
      isUpdated = true;
    }

    if (isUpdated) {
      await post.save();
    }

    return post;
  }
}

export { UpdatePostService };
