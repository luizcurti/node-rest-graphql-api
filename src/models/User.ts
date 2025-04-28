import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  username: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>('User', UserSchema);

export { User, IUser };
