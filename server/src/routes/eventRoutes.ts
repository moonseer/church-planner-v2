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

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - start
 *         - end
 *         - eventType
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the event
 *         title:
 *           type: string
 *           description: The title of the event
 *         description:
 *           type: string
 *           description: A detailed description of the event
 *         start:
 *           type: string
 *           format: date-time
 *           description: The start date and time of the event
 *         end:
 *           type: string
 *           format: date-time
 *           description: The end date and time of the event
 *         location:
 *           type: string
 *           description: The location where the event will take place
 *         allDay:
 *           type: boolean
 *           description: Whether the event lasts all day
 *         eventType:
 *           type: string
 *           description: Reference to the event type
 *         church:
 *           type: string
 *           description: Reference to the church this event belongs to
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created the event
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the event was created
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         title: Sunday Morning Service
 *         description: Regular Sunday morning worship service
 *         start: 2023-03-19T09:00:00.000Z
 *         end: 2023-03-19T11:00:00.000Z
 *         location: Main Sanctuary
 *         allDay: false
 *         eventType: 60d21b4667d0d8992e610c85
 *         church: 60d21b4667d0d8992e610c85
 *         createdBy: 60d21b4667d0d8992e610c85
 *         createdAt: 2023-01-15T19:08:24.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management API
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Returns the list of all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering events
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering events
 *     responses:
 *       200:
 *         description: The list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: The event was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Routes for /api/events
router.route('/')
  .get(getEvents)
  .post(createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event ID
 *     responses:
 *       200:
 *         description: The event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The event was not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: The event was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The event was not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event ID
 *     responses:
 *       200:
 *         description: The event was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The event was not found
 *       500:
 *         description: Server error
 */

// Routes for /api/events/:id
router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

export default router; 