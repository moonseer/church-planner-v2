import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// User notification routes
router.route('/user/:userId')
  .get(authenticate, notificationController.getUserNotifications);

// Mark all notifications as read for a user
router.route('/user/:userId/read-all')
  .post(authenticate, notificationController.markAllAsRead);

// Single notification routes
router.route('/:id')
  .get(authenticate, notificationController.getNotification)
  .put(authenticate, isAdmin, notificationController.updateNotification)
  .delete(authenticate, notificationController.deleteNotification);

// Mark notification as read
router.route('/:id/read')
  .post(authenticate, notificationController.markAsRead);

// Create notification route
router.route('/')
  .post(authenticate, notificationController.createNotification);

export default router; 