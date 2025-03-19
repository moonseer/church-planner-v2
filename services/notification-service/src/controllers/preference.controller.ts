import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import NotificationPreference, { INotificationPreference, PreferenceCategory } from '../models/NotificationPreference';
import { NotificationType } from '../models/Notification';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorMiddleware';

/**
 * Get a user's notification preferences
 */
export const getUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only access their own preferences
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to access preferences for this user', 403));
      return;
    }
    
    // Find preferences
    let preferences = await NotificationPreference.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: new mongoose.Types.ObjectId(userId),
        churchId: req.user?.churchId ? new mongoose.Types.ObjectId(req.user.churchId) : undefined,
      });
      
      logger.info(`Created default notification preferences for user ${userId}`);
    }
    
    logger.debug(`Retrieved notification preferences for user ${userId}`);
    
    ApiResponse.success(res, preferences);
  } catch (error) {
    logger.error('Error retrieving user notification preferences', { error, userId: req.params.userId });
    next(new AppError('Error retrieving notification preferences', 500));
  }
};

/**
 * Update a user's notification preferences
 */
export const updateUserPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only update their own preferences
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to update preferences for this user', 403));
      return;
    }
    
    // Find preferences
    let preferences = await NotificationPreference.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    // If preferences don't exist, create them
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: new mongoose.Types.ObjectId(userId),
        churchId: req.user?.churchId ? new mongoose.Types.ObjectId(req.user.churchId) : undefined,
        ...req.body
      });
      
      logger.info(`Created notification preferences for user ${userId}`);
      ApiResponse.created(res, preferences);
      return;
    }
    
    // Update preferences
    // Check and validate all provided fields
    if (req.body.preferences) {
      // Validate preference categories
      for (const category in req.body.preferences) {
        if (!Object.values(PreferenceCategory).includes(category as PreferenceCategory)) {
          next(new AppError(`Invalid preference category: ${category}`, 400));
          return;
        }
        
        const pref = req.body.preferences[category];
        
        // Validate channels
        if (pref.channels) {
          for (const channel of pref.channels) {
            if (!Object.values(NotificationType).includes(channel)) {
              next(new AppError(`Invalid notification channel: ${channel}`, 400));
              return;
            }
          }
        }
      }
      
      // Update specific preferences
      for (const category in req.body.preferences) {
        preferences.preferences[category] = {
          ...preferences.preferences[category],
          ...req.body.preferences[category]
        };
      }
    }
    
    // Update global preferences
    if (req.body.globalPreferences) {
      preferences.globalPreferences = {
        ...preferences.globalPreferences,
        ...req.body.globalPreferences
      };
      
      // Validate global preferences structure
      if (preferences.globalPreferences.digest && preferences.globalPreferences.digest.frequency) {
        if (!['daily', 'weekly', 'monthly'].includes(preferences.globalPreferences.digest.frequency)) {
          next(new AppError('Invalid digest frequency. Must be daily, weekly, or monthly.', 400));
          return;
        }
      }
    }
    
    // Update device tokens
    if (req.body.deviceTokens) {
      preferences.deviceTokens = {
        ...preferences.deviceTokens,
        ...req.body.deviceTokens
      };
    }
    
    // Save preferences
    await preferences.save();
    
    logger.info(`Updated notification preferences for user ${userId}`);
    
    ApiResponse.success(res, preferences);
  } catch (error) {
    logger.error('Error updating user notification preferences', { error, userId: req.params.userId });
    next(new AppError('Error updating notification preferences', 500));
  }
};

/**
 * Add a device token for push notifications
 */
export const addDeviceToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { token, device, platform } = req.body;
    
    // Validate required fields
    if (!token || !device || !platform) {
      next(new AppError('Missing required fields: token, device, platform', 400));
      return;
    }
    
    // Validate platform
    if (!['ios', 'android', 'web'].includes(platform)) {
      next(new AppError('Invalid platform. Must be ios, android, or web.', 400));
      return;
    }
    
    // Ensure user can only update their own preferences
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to update preferences for this user', 403));
      return;
    }
    
    // Find preferences
    let preferences = await NotificationPreference.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    // If preferences don't exist, create them
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: new mongoose.Types.ObjectId(userId),
        churchId: req.user?.churchId ? new mongoose.Types.ObjectId(req.user.churchId) : undefined,
        deviceTokens: {
          [device]: {
            token,
            device,
            platform,
            createdAt: new Date(),
            lastUsedAt: new Date()
          }
        }
      });
      
      logger.info(`Created notification preferences with device token for user ${userId}`);
      ApiResponse.created(res, preferences);
      return;
    }
    
    // Add or update device token
    if (!preferences.deviceTokens) {
      preferences.deviceTokens = {};
    }
    
    preferences.deviceTokens[device] = {
      token,
      device,
      platform,
      createdAt: preferences.deviceTokens[device]?.createdAt || new Date(),
      lastUsedAt: new Date()
    };
    
    // Save preferences
    await preferences.save();
    
    logger.info(`Added/updated device token for user ${userId}`);
    
    ApiResponse.success(res, preferences);
  } catch (error) {
    logger.error('Error adding device token', { error, userId: req.params.userId });
    next(new AppError('Error adding device token', 500));
  }
};

/**
 * Remove a device token
 */
export const removeDeviceToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, deviceId } = req.params;
    
    // Ensure user can only update their own preferences
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to update preferences for this user', 403));
      return;
    }
    
    // Find preferences
    const preferences = await NotificationPreference.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!preferences) {
      next(new AppError('Notification preferences not found', 404));
      return;
    }
    
    // Check if device token exists
    if (!preferences.deviceTokens || !preferences.deviceTokens[deviceId]) {
      next(new AppError('Device token not found', 404));
      return;
    }
    
    // Remove device token
    const { [deviceId]: removedToken, ...remainingTokens } = preferences.deviceTokens;
    preferences.deviceTokens = remainingTokens;
    
    // Save preferences
    await preferences.save();
    
    logger.info(`Removed device token ${deviceId} for user ${userId}`);
    
    ApiResponse.success(res, { message: 'Device token removed successfully' });
  } catch (error) {
    logger.error('Error removing device token', { error, userId: req.params.userId, deviceId: req.params.deviceId });
    next(new AppError('Error removing device token', 500));
  }
};

/**
 * Enable or disable a specific notification category
 */
export const updateCategoryPreference = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, category } = req.params;
    const { enabled, channels } = req.body;
    
    // Validate category
    if (!Object.values(PreferenceCategory).includes(category as PreferenceCategory)) {
      next(new AppError(`Invalid preference category: ${category}`, 400));
      return;
    }
    
    // Validate channels if provided
    if (channels) {
      for (const channel of channels) {
        if (!Object.values(NotificationType).includes(channel)) {
          next(new AppError(`Invalid notification channel: ${channel}`, 400));
          return;
        }
      }
    }
    
    // Ensure user can only update their own preferences
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to update preferences for this user', 403));
      return;
    }
    
    // Find preferences
    let preferences = await NotificationPreference.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    // If preferences don't exist, create them
    if (!preferences) {
      const defaultPrefs: any = {};
      defaultPrefs[category] = {
        enabled: enabled !== undefined ? enabled : true,
        channels: channels || [NotificationType.EMAIL, NotificationType.INAPP]
      };
      
      preferences = await NotificationPreference.create({
        userId: new mongoose.Types.ObjectId(userId),
        churchId: req.user?.churchId ? new mongoose.Types.ObjectId(req.user.churchId) : undefined,
        preferences: defaultPrefs
      });
      
      logger.info(`Created notification preferences with category preference for user ${userId}`);
      ApiResponse.created(res, preferences);
      return;
    }
    
    // Update category preference
    if (!preferences.preferences) {
      preferences.preferences = {};
    }
    
    if (!preferences.preferences[category]) {
      preferences.preferences[category] = {
        enabled: true,
        channels: [NotificationType.EMAIL, NotificationType.INAPP]
      };
    }
    
    if (enabled !== undefined) {
      preferences.preferences[category].enabled = enabled;
    }
    
    if (channels) {
      preferences.preferences[category].channels = channels;
    }
    
    // Save preferences
    await preferences.save();
    
    logger.info(`Updated category preference ${category} for user ${userId}`);
    
    ApiResponse.success(res, preferences);
  } catch (error) {
    logger.error('Error updating category preference', { 
      error, 
      userId: req.params.userId, 
      category: req.params.category 
    });
    next(new AppError('Error updating category preference', 500));
  }
}; 