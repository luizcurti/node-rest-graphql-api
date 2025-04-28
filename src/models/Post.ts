import mongoose, { Schema, Document, Types } from 'mongoose';

interface IPost extends Document {
  title: string;
  content: string;
  createdAt: Date;
  author: Types.ObjectId;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Post = mongoose.model<IPost>('Post', PostSchema);

export { Post, IPost };
