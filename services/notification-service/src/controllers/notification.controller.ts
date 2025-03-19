import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Notification, { NotificationType, NotificationStatus, INotification } from '../models/Notification';
import NotificationPreference from '../models/NotificationPreference';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorMiddleware';
import emailService from '../utils/emailService';
import config from '../config';

/**
 * Get all notifications for a user
 */
export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20', isRead, isArchived, type } = req.query;
    
    // Convert string parameters to their appropriate types
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Build filter
    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    // Add optional filters
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === 'true';
    }
    
    if (type) {
      filter.type = type;
    }
    
    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);
    
    // Get total count
    const total = await Notification.countDocuments(filter);
    
    logger.debug(`Retrieved ${notifications.length} notifications for user ${userId}`);
    
    ApiResponse.success(res, {
      notifications,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    logger.error('Error retrieving user notifications', { error });
    next(new AppError('Error retrieving notifications', 500));
  }
};

/**
 * Get a single notification by ID
 */
export const getNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid notification ID', 400));
      return;
    }
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      next(new AppError('Notification not found', 404));
      return;
    }
    
    // Check if user is authorized to access this notification
    if (notification.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to access this notification', 403));
      return;
    }
    
    logger.debug(`Retrieved notification ${id}`);
    
    ApiResponse.success(res, notification);
  } catch (error) {
    logger.error('Error retrieving notification', { error, id: req.params.id });
    next(new AppError('Error retrieving notification', 500));
  }
};

/**
 * Create a new notification
 */
export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, type, title, content, metadata } = req.body;
    
    // Validate required fields
    if (!userId || !type || !title || !content) {
      next(new AppError('Missing required fields: userId, type, title, content', 400));
      return;
    }
    
    // Check if notification type is valid
    if (!Object.values(NotificationType).includes(type)) {
      next(new AppError(`Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`, 400));
      return;
    }
    
    // Calculate expiration date if not provided
    let expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
    
    if (!expiresAt) {
      // Set default expiration based on config
      const defaultTTL = config.notifications.defaultTTL;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + defaultTTL);
    }
    
    // Get user notification preferences
    const preferences = await NotificationPreference.findOne({ userId });
    
    // Check if user has disabled this type of notification globally
    if (preferences) {
      const typeEnabled = getTypeEnabled(type, preferences);
      
      if (!typeEnabled) {
        logger.info(`Notification not created: User ${userId} has disabled ${type} notifications`);
        ApiResponse.success(res, { 
          message: `Notification not created: User has disabled ${type} notifications`,
          skipped: true
        });
        return;
      }
    }
    
    // Create notification
    const notification = await Notification.create({
      userId,
      churchId: req.body.churchId,
      type,
      title,
      content,
      status: NotificationStatus.PENDING,
      expiresAt,
      metadata: metadata || {},
      delivery: {
        attempts: 0,
      },
    });
    
    logger.info(`Notification created: ${notification._id} for user ${userId}`);
    
    // Send email notification if type is EMAIL
    if (type === NotificationType.EMAIL) {
      try {
        await sendEmailNotification(notification);
      } catch (emailError) {
        logger.error('Failed to send email notification', { emailError, notificationId: notification._id });
        // Continue even if email fails - we'll retry later
      }
    }
    
    // Return the created notification
    ApiResponse.created(res, notification);
  } catch (error) {
    logger.error('Error creating notification', { error, body: req.body });
    next(new AppError('Error creating notification', 500));
  }
};

/**
 * Update a notification
 */
export const updateNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid notification ID', 400));
      return;
    }
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      next(new AppError('Notification not found', 404));
      return;
    }
    
    // Check if user is authorized to update this notification
    if (req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to update this notification', 403));
      return;
    }
    
    // Update allowed fields only
    const allowedUpdates = ['status', 'isRead', 'isArchived', 'content', 'title', 'metadata'];
    const updates: any = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    // Add readAt if marking as read
    if (updates.isRead === true && !notification.isRead) {
      updates.readAt = new Date();
    }
    
    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    logger.info(`Notification updated: ${id}`);
    
    ApiResponse.success(res, updatedNotification);
  } catch (error) {
    logger.error('Error updating notification', { error, id: req.params.id });
    next(new AppError('Error updating notification', 500));
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid notification ID', 400));
      return;
    }
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      next(new AppError('Notification not found', 404));
      return;
    }
    
    // Check if user is authorized to mark this notification as read
    if (notification.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to access this notification', 403));
      return;
    }
    
    // Skip if already read
    if (notification.isRead) {
      ApiResponse.success(res, { message: 'Notification already marked as read', notification });
      return;
    }
    
    // Mark as read
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    logger.debug(`Notification ${id} marked as read`);
    
    ApiResponse.success(res, notification);
  } catch (error) {
    logger.error('Error marking notification as read', { error, id: req.params.id });
    next(new AppError('Error marking notification as read', 500));
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only mark their own notifications as read
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to mark notifications for this user', 403));
      return;
    }
    
    // Mark all unread notifications as read
    const result = await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    
    ApiResponse.success(res, {
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('Error marking all notifications as read', { error, userId: req.params.userId });
    next(new AppError('Error marking all notifications as read', 500));
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid notification ID', 400));
      return;
    }
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      next(new AppError('Notification not found', 404));
      return;
    }
    
    // Check if user is authorized to delete this notification
    if (notification.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to delete this notification', 403));
      return;
    }
    
    // Delete notification
    await notification.deleteOne();
    
    logger.info(`Notification deleted: ${id}`);
    
    ApiResponse.success(res, { message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error('Error deleting notification', { error, id: req.params.id });
    next(new AppError('Error deleting notification', 500));
  }
};

/**
 * Helper function to send email notification
 */
const sendEmailNotification = async (notification: INotification): Promise<void> => {
  try {
    // Increment delivery attempts
    notification.delivery.attempts += 1;
    notification.delivery.lastAttemptAt = new Date();
    
    // Send email
    const info = await emailService.sendEmail({
      to: notification.metadata.email || '', // Email should be provided in metadata
      subject: notification.title,
      text: notification.content,
      html: notification.metadata.html || '',
    });
    
    // Update notification status
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
    notification.delivery.messageId = info.messageId;
    
    // Add receipt
    if (!notification.delivery.receipts) {
      notification.delivery.receipts = [];
    }
    
    notification.delivery.receipts.push({
      status: 'sent',
      timestamp: new Date(),
      providerId: info.messageId,
    });
    
    await notification.save();
    
    logger.info(`Email notification sent: ${notification._id}`);
  } catch (error) {
    // Update notification with failure
    notification.status = NotificationStatus.FAILED;
    notification.delivery.failureReason = error.message || 'Unknown error';
    
    // Add receipt for failed attempt
    if (!notification.delivery.receipts) {
      notification.delivery.receipts = [];
    }
    
    notification.delivery.receipts.push({
      status: 'failed',
      timestamp: new Date(),
      message: error.message || 'Unknown error',
    });
    
    await notification.save();
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

/**
 * Helper function to check if a notification type is enabled for a user
 */
const getTypeEnabled = (type: NotificationType, preferences: any): boolean => {
  // Check type-specific preference
  switch (type) {
    case NotificationType.EMAIL:
      return preferences.globalPreferences.emailEnabled !== false;
    case NotificationType.SMS:
      return preferences.globalPreferences.smsEnabled !== false;
    case NotificationType.PUSH:
      return preferences.globalPreferences.pushEnabled !== false;
    case NotificationType.INAPP:
      return preferences.globalPreferences.inAppEnabled !== false;
    default:
      return true;
  }
}; 