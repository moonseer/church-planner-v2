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

/**
 * @swagger
 * components:
 *   schemas:
 *     EventType:
 *       type: object
 *       required:
 *         - name
 *         - color
 *         - church
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the event type
 *         name:
 *           type: string
 *           description: The name of the event type
 *         description:
 *           type: string
 *           description: A description of the event type
 *         color:
 *           type: string
 *           description: The color code for the event type (hex format)
 *         church:
 *           type: string
 *           description: Reference to the church this event type belongs to
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created the event type
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the event type was created
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         name: Sunday Service
 *         description: Regular Sunday worship service
 *         color: #4287f5
 *         church: 60d21b4667d0d8992e610c85
 *         createdBy: 60d21b4667d0d8992e610c85
 *         createdAt: 2023-01-15T19:08:24.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Event Types
 *   description: Event type management API
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/event-types:
 *   get:
 *     summary: Returns the list of all event types for the user's church
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of event types
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EventType'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new event type
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the event type
 *               description:
 *                 type: string
 *                 description: A description of the event type
 *               color:
 *                 type: string
 *                 description: The color code for the event type (hex format)
 *     responses:
 *       201:
 *         description: The event type was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EventType'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Routes for /api/event-types
router.route('/')
  .get(getEventTypes)
  .post(createEventType);

/**
 * @swagger
 * /api/event-types/{id}:
 *   get:
 *     summary: Get an event type by ID
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event type ID
 *     responses:
 *       200:
 *         description: The event type details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EventType'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event type belongs to a different church
 *       404:
 *         description: The event type was not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update an event type by ID
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the event type
 *               description:
 *                 type: string
 *                 description: A description of the event type
 *               color:
 *                 type: string
 *                 description: The color code for the event type (hex format)
 *     responses:
 *       200:
 *         description: The event type was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EventType'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Event type belongs to a different church
 *       404:
 *         description: The event type was not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete an event type by ID
 *     tags: [Event Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event type ID
 *     responses:
 *       200:
 *         description: The event type was deleted
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
 *       403:
 *         description: Forbidden - Event type belongs to a different church
 *       404:
 *         description: The event type was not found
 *       500:
 *         description: Server error
 */

// Routes for /api/event-types/:id
router.route('/:id')
  .get(getEventType)
  .put(updateEventType)
  .delete(deleteEventType);

export default router; 