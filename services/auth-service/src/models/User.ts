import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/config';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  loginAttempts: number;
  lockUntil: number | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  createdAt: Date;
  updatedAt: Date;
}

// Password complexity validation function
const validatePasswordComplexity = (password: string): boolean => {
  if (password.length < config.passwordComplexity.minLength) return false;
  
  // Check for uppercase letters
  if (config.passwordComplexity.requireUppercase && !/[A-Z]/.test(password)) return false;
  
  // Check for lowercase letters
  if (config.passwordComplexity.requireLowercase && !/[a-z]/.test(password)) return false;
  
  // Check for numbers
  if (config.passwordComplexity.requireNumbers && !/[0-9]/.test(password)) return false;
  
  // Check for special characters
  if (config.passwordComplexity.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [config.passwordComplexity.minLength, `Password must be at least ${config.passwordComplexity.minLength} characters`],
      validate: [
        {
          validator: validatePasswordComplexity,
          message: 'Password must contain uppercase, lowercase, number, and special character'
        }
      ]
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type: String,
      default: null
    },
    refreshTokenExpiry: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();

  try {
    // Validate password complexity again (belt and suspenders approach)
    if (!validatePasswordComplexity(this.password)) {
      throw new Error('Password does not meet complexity requirements');
    }
    
    const salt = await bcrypt.genSalt(config.passwordSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: Error | unknown) {
    const mongooseError = error instanceof Error ? error : new Error('Password hashing failed');
    next(mongooseError);
  }
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
UserSchema.methods.isLocked = function (): boolean {
  // Check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, reset the count
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
  } else {
    // Increment login attempts count
    this.loginAttempts += 1;
    
    // Lock the account if we've reached max attempts
    if (this.loginAttempts >= config.maxLoginAttempts) {
      this.lockUntil = Date.now() + config.lockTime;
    }
  }

  await this.save();
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save();
};

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User; 