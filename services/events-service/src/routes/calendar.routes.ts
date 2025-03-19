import express from 'express';
import * as calendarController from '../controllers/calendar.controller';
import { authenticate, isAdmin, isChurchAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Get calendar events (with pagination and filtering)
router.route('/')
  .get(authenticate, calendarController.getCalendarEvents);

// Export events to various formats
router.route('/export/:churchId')
  .get(authenticate, calendarController.exportEvents);

// Generate iCal feed for church events
router.route('/ical/:churchId')
  .get(calendarController.generateICalFeed); // Public route for calendar subscriptions

// Handle webhooks from external calendar providers
router.route('/webhook/:provider')
  .post(calendarController.handleExternalCalendarWebhook);

export default router; 