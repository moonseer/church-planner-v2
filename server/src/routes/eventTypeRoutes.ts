import express from 'express';
import {
  getEventTypes,
  getEventType,
  createEventType,
  updateEventType,
  deleteEventType
} from '../controllers/eventTypeController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes for /api/event-types
router.route('/')
  .get(getEventTypes)
  .post(createEventType);

// Routes for /api/event-types/:id
router.route('/:id')
  .get(getEventType)
  .put(updateEventType)
  .delete(deleteEventType);

export default router; 