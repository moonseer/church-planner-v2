import express from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate, isAdmin, isChurchAdmin, isEventTeamMember } from '../middleware/authMiddleware';
import { validate, eventSchemas } from '../middleware/validationMiddleware';

const router = express.Router();

// Base routes
router.route('/')
  .get(authenticate, validate(eventSchemas.eventQuery, 'query'), eventController.getAllEvents)
  .post(authenticate, validate(eventSchemas.createEvent), eventController.createEvent);

// Single event routes
router.route('/:id')
  .get(authenticate, eventController.getEventById)
  .put(authenticate, isEventTeamMember, validate(eventSchemas.updateEvent), eventController.updateEvent)
  .delete(authenticate, isEventTeamMember, eventController.deleteEvent);

// Hard delete (admin only)
router.route('/:id/hard-delete')
  .delete(authenticate, isAdmin, eventController.hardDeleteEvent);

// Church-specific events
router.route('/church/:churchId')
  .get(authenticate, validate(eventSchemas.eventQuery, 'query'), eventController.getEventsByChurch);

// Team member management
router.route('/:id/team')
  .post(authenticate, isEventTeamMember, validate(eventSchemas.addTeamMember), eventController.addTeamMember);

router.route('/:id/team/:memberId')
  .put(authenticate, isEventTeamMember, eventController.updateTeamMember)
  .delete(authenticate, isEventTeamMember, eventController.removeTeamMember);

// Attendee management
router.route('/:id/attendees')
  .post(authenticate, validate(eventSchemas.addAttendee), eventController.registerAttendee);

router.route('/:id/attendees/:attendeeId')
  .put(authenticate, isEventTeamMember, validate(eventSchemas.updateAttendeeStatus), eventController.updateAttendeeStatus)
  .delete(authenticate, isEventTeamMember, eventController.removeAttendee);

// Reports
router.route('/:id/attendance-report')
  .get(authenticate, isEventTeamMember, eventController.getAttendanceReport);

// Recurring events
router.route('/:id/recurring')
  .post(authenticate, isEventTeamMember, eventController.createRecurringEvents);

export default router; 