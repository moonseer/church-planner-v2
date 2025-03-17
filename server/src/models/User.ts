import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, JwtPayload } from '@shared/types/auth';
import { IUserDocument, IUserModel } from '@shared/types/mongoose';

// Export IUser as an alias for IUserDocument to maintain compatibility with tests
export type IUser = IUserDocument;

// Add methods to the user document
export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

// Combine document with its methods
type UserDocument = IUserDocument & IUserMethods;

// Password validation function
const validatePassword = (password: string): boolean => {
  // At least 8 characters long
  if (password.length < 8) return false;
  
  // Contains at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Contains at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Contains at least one number
  if (!/[0-9]/.test(password)) return false;
  
  // Contains at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};

const UserSchema = new mongoose.Schema<UserDocument, IUserModel>({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: validatePassword,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
    select: false,
  },
  passwordLastChanged: {
    type: Date,
    default: Date.now,
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
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
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

  // Update passwordLastChanged timestamp
  this.passwordLastChanged = new Date();
  
  // Reset login attempts on password change
  if (this.isModified('password')) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  // Get JWT secret from environment variables or generate a secure random one
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.warn('WARNING: JWT_SECRET environment variable not set. Using a less secure fallback.');
    // In production, this should never happen as the app should fail to start without a JWT_SECRET
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
  }
  
  const payload = { id: this._id.toString() };
  
  // @ts-ignore - Ignoring TypeScript error for JWT sign
  return jwt.sign(payload, jwtSecret || 'defaultsecret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
UserSchema.methods.isLocked = function () {
  // Check for a future lockUntil timestamp
  return this.lockUntil && this.lockUntil > new Date();
};

// Track failed login attempts and lock account if needed
UserSchema.methods.incrementLoginAttempts = async function () {
  // If previous lock has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    // Increment login attempts
    this.loginAttempts += 1;
  }

  // Lock the account if we've reached the max attempts
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  return this.save();
};

const User = mongoose.model<UserDocument, IUserModel>('User', UserSchema);

export default User; 