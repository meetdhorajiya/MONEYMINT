import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Password can be optional and is not selected by default
  name: string;
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
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    select: false, // Prevents password from being sent in queries by default
  },
}, { timestamps: true });

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);