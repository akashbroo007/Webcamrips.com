import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  isAdmin: boolean;
  isPremium: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  providers?: Array<{
    provider: string;
    providerId: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false,
    select: false
  },
  avatar: {
    type: String
  },
  bio: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    select: true
  },
  resetPasswordExpires: {
    type: Date,
    select: true
  },
  providers: [{
    provider: {
      type: String,
      required: true
    },
    providerId: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next: () => void) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
UserSchema.index({ 'providers.providerId': 1 });
UserSchema.index({ resetPasswordToken: 1 });

let User: Model<IUser>;

try {
  // Try to get existing model
  User = mongoose.model<IUser>('User');
} catch {
  // Define model if it doesn't exist
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User; 