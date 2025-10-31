import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Password can be optional and is not selected by default
  name: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
  avatarUpdatedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a name.'] 
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    select: false, // Prevents password from being sent in queries by default
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  avatarId: {
    type: String,
    default: null,
  },
  avatarUpdatedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);