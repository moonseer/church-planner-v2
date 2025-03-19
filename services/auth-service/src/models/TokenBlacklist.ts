import mongoose, { Document, Schema } from 'mongoose';
import config from '../config/config';

export interface ITokenBlacklist extends Document {
  token: string;
  tokenType: 'access' | 'refresh';
  expiresAt: Date;
  createdAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    tokenType: {
      type: String,
      enum: ['access', 'refresh'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired entries
    },
  },
  {
    timestamps: true,
  }
);

// Ensure index for token uniqueness
TokenBlacklistSchema.index({ token: 1 }, { unique: true });

// Create a TTL index for automatic removal after token expiration
// This makes sure we don't store blacklisted tokens forever
TokenBlacklistSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: config.tokenBlacklistTTL
});

const TokenBlacklist = mongoose.model<ITokenBlacklist>('TokenBlacklist', TokenBlacklistSchema);

export default TokenBlacklist; 