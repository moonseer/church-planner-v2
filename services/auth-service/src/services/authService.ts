import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import TokenBlacklist from '../models/TokenBlacklist';
import config from '../config/config';
import { randomBytes } from 'crypto';

// Types for auth service
export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthServiceResponse {
  tokens?: TokenResponse;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: string;
  };
  error?: string;
}

export interface JwtVerificationResult {
  valid: boolean;
  decoded?: jwt.JwtPayload | { id: string; email: string; role: string };
  error?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData: RegisterUserInput): Promise<AuthServiceResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        return { error: 'Email is already registered' };
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        tokens,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error registering user';
      return { error: errorMessage };
    }
  }

  /**
   * Authenticate user and generate tokens
   */
  async loginUser(credentials: LoginUserInput): Promise<AuthServiceResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: credentials.email.toLowerCase() });
      if (!user) {
        return { error: 'Invalid email or password' };
      }

      // Check if account is locked
      if (user.isLocked()) {
        const lockTime = user.lockUntil ? new Date(user.lockUntil) : new Date();
        return { 
          error: `Account is locked. Try again after ${lockTime.toLocaleTimeString()}` 
        };
      }

      // Verify password
      const isMatch = await user.comparePassword(credentials.password);
      if (!isMatch) {
        // Increment login attempts on failed password
        await user.incrementLoginAttempts();
        return { error: 'Invalid email or password' };
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        tokens,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error logging in';
      return { error: errorMessage };
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: IUser): Promise<TokenResponse> {
    // Generate access token
    const accessToken = this.generateAccessToken(user);
    
    // Generate refresh token (cryptographically secure random token)
    const refreshToken = randomBytes(40).toString('hex');
    
    // Calculate expiry for refresh token
    const refreshExpiry = new Date();
    refreshExpiry.setTime(refreshExpiry.getTime() + this.parseTimeToMilliseconds(config.refreshExpire));
    
    // Store refresh token with user
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshExpiry;
    await user.save();
    
    // Calculate expiresIn in seconds for client
    const expiresIn = this.parseTimeToSeconds(config.jwtExpire);
    
    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Parse time string (like '7d', '24h', '30m') to seconds
   */
  private parseTimeToSeconds(timeStr: string): number {
    const match = timeStr.match(/^(\d+)([dhms])$/);
    if (!match) return 3600; // Default to 1 hour
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      case 's': return value;
      default: return 3600;
    }
  }

  /**
   * Parse time string to milliseconds
   */
  private parseTimeToMilliseconds(timeStr: string): number {
    return this.parseTimeToSeconds(timeStr) * 1000;
  }

  /**
   * Generate access token
   */
  private generateAccessToken(user: IUser): string {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    
    const options: SignOptions = { 
      expiresIn: config.jwtExpire,
      audience: config.jwtAudience,
      issuer: config.jwtIssuer
    };
    
    // Convert string secret to Buffer to match jsonwebtoken's expected types
    const secretBuffer = Buffer.from(config.jwtSecret, 'utf-8');
    
    // @ts-ignore - TypeScript has issues with the jwt.sign method's type definitions
    return jwt.sign(payload, secretBuffer, options);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AuthServiceResponse> {
    try {
      const { refreshToken } = refreshTokenRequest;
      
      // Verify refresh token isn't blacklisted
      const isBlacklisted = await TokenBlacklist.findOne({ token: refreshToken, tokenType: 'refresh' });
      if (isBlacklisted) {
        return { error: 'Invalid refresh token' };
      }
      
      // Find user with this refresh token
      const user = await User.findOne({ 
        refreshToken, 
        refreshTokenExpiry: { $gt: new Date() } 
      });
      
      if (!user) {
        return { error: 'Invalid or expired refresh token' };
      }
      
      // Generate new access token
      const accessToken = this.generateAccessToken(user);
      
      // Calculate expiry for client
      const expiresIn = this.parseTimeToSeconds(config.jwtExpire);
      
      return {
        tokens: {
          accessToken,
          refreshToken, // Return the same refresh token
          expiresIn
        },
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error refreshing token';
      return { error: errorMessage };
    }
  }

  /**
   * Logout user by blacklisting tokens
   */
  async logout(accessToken: string, refreshToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify access token
      const { valid, decoded } = this.verifyToken(accessToken);
      
      if (!valid || !decoded) {
        return { success: false, error: 'Invalid access token' };
      }
      
      // Calculate token expiration
      const accessTokenExp = new Date();
      const jwtPayload = decoded as jwt.JwtPayload;
      if (jwtPayload.exp) {
        accessTokenExp.setTime(jwtPayload.exp * 1000);
      } else {
        // If no exp in token, set a reasonable expiration (1 hour)
        accessTokenExp.setTime(accessTokenExp.getTime() + (60 * 60 * 1000));
      }
      
      // Find user with this refresh token
      const user = await User.findOne({ refreshToken });
      
      if (user) {
        // Get refresh token expiration
        const refreshTokenExp = user.refreshTokenExpiry || new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
        
        // Add both tokens to blacklist
        await TokenBlacklist.create({
          token: accessToken,
          tokenType: 'access',
          expiresAt: accessTokenExp
        });
        
        await TokenBlacklist.create({
          token: refreshToken,
          tokenType: 'refresh',
          expiresAt: refreshTokenExp
        });
        
        // Clear refresh token from user
        user.refreshToken = undefined;
        user.refreshTokenExpiry = undefined;
        await user.save();
      }
      
      return { success: true };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error during logout';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JwtVerificationResult {
    try {
      // Check if token is blacklisted
      const isBlacklistedPromise = TokenBlacklist.findOne({ token, tokenType: 'access' });
      
      // Convert string secret to Buffer to match jsonwebtoken's expected types
      const secretBuffer = Buffer.from(config.jwtSecret, 'utf-8');
      
      // @ts-ignore - TypeScript has issues with the jwt.verify method's type definitions
      const decoded = jwt.verify(token, secretBuffer, {
        audience: config.jwtAudience,
        issuer: config.jwtIssuer
      });
      
      // Check if token is blacklisted
      if (isBlacklistedPromise) {
        return { valid: false, error: 'Token has been revoked' };
      }
      
      return { valid: true, decoded: decoded as jwt.JwtPayload };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
      return { valid: false, error: errorMessage };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthServiceResponse> {
    try {
      const user = await User.findById(userId).select('-password -loginAttempts -lockUntil -refreshToken -refreshTokenExpiry');
      if (!user) {
        return { error: 'User not found' };
      }

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error retrieving user';
      return { error: errorMessage };
    }
  }

  /**
   * Update user details
   */
  async updateUserDetails(userId: string, updateData: Partial<RegisterUserInput>): Promise<AuthServiceResponse> {
    try {
      if (updateData.email) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          return { error: 'Email is already in use' };
        }
        
        updateData.email = updateData.email.toLowerCase();
      }

      // Find and update user
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -loginAttempts -lockUntil -refreshToken -refreshTokenExpiry');

      if (!user) {
        return { error: 'User not found' };
      }

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating user details';
      return { error: errorMessage };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(
    userId: string, 
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string }
  ): Promise<AuthServiceResponse> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: 'User not found' };
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return { error: 'Current password is incorrect' };
      }

      // Update to new password
      user.password = newPassword;
      await user.save();

      // Generate new tokens for security
      const tokens = await this.generateTokens(user);

      return {
        tokens,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating password';
      return { error: errorMessage };
    }
  }
}

export default new AuthService(); 