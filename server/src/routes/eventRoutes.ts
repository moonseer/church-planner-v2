import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes for /api/events
router.route('/')
  .get(getEvents)
  .post(createEvent);

// Routes for /api/events/:id
router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

export default router; 