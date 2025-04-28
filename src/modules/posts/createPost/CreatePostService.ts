import { Post } from '@models/Post';

interface CreatePostDTO {
  title: string;
  content: string;
  author: string;
}

class CreatePostService {
  async execute({ title, content, author }: CreatePostDTO) {
    const postAlreadyExists = await Post.findOne({ title });

    if (postAlreadyExists) {
      throw new Error('Post with this title already exists!');
    }

    const post = await Post.create({
      title,
      content,
      author,
    });

    return post;
  }
}

export { CreatePostService };
