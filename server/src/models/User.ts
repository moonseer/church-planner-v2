import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, JwtPayload } from '@shared/types/auth';
import { IUserDocument, IUserModel } from '@shared/types/mongoose';

// Add methods to the user document
export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

// Combine document with its methods
type UserDocument = IUserDocument & IUserMethods;

const UserSchema = new mongoose.Schema<UserDocument, IUserModel>({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  church: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';
  const payload = { id: this._id.toString() };
  
  // @ts-ignore - Ignoring TypeScript error for JWT sign
  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<UserDocument, IUserModel>('User', UserSchema);

export default User; 