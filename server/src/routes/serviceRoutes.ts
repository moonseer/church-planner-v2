import express from 'express';
import { 
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ServiceItem:
 *       type: object
 *       required:
 *         - order
 *         - title
 *         - type
 *         - duration
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the service item
 *         order:
 *           type: integer
 *           description: The order of the item in the service
 *         title:
 *           type: string
 *           description: The title of the service item
 *         type:
 *           type: string
 *           enum: [worship, prayer, sermon, offering, communion, announcement, scripture, testimony, other]
 *           description: The type of service item
 *         duration:
 *           type: integer
 *           description: The duration of the item in minutes
 *         notes:
 *           type: string
 *           description: Additional notes for the service item
 *         assignedTo:
 *           type: string
 *           description: Reference to the user assigned to this item
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         order: 1
 *         title: Opening Worship
 *         type: worship
 *         duration: 15
 *         notes: 3 songs, starting with a call to worship
 *         assignedTo: 60d21b4667d0d8992e610c85
 *     Service:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - church
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the service
 *         title:
 *           type: string
 *           description: The title of the service
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date and time of the service
 *         description:
 *           type: string
 *           description: A detailed description of the service
 *         church:
 *           type: string
 *           description: Reference to the church this service belongs to
 *         event:
 *           type: string
 *           description: Reference to the event associated with this service
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created the service
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the service was created
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceItem'
 *           description: The items included in the service
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         title: Sunday Morning Service
 *         date: 2023-03-19T09:00:00.000Z
 *         description: Regular Sunday morning worship service
 *         church: 60d21b4667d0d8992e610c85
 *         event: 60d21b4667d0d8992e610c85
 *         createdBy: 60d21b4667d0d8992e610c85
 *         createdAt: 2023-01-15T19:08:24.000Z
 *         items: [
 *           {
 *             _id: 60d21b4667d0d8992e610c85,
 *             order: 1,
 *             title: Opening Worship,
 *             type: worship,
 *             duration: 15,
 *             notes: 3 songs, starting with a call to worship,
 *             assignedTo: 60d21b4667d0d8992e610c85
 *           }
 *         ]
 */

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service planning API
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Returns the list of all services for the user's church
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for filtering services
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for filtering services
 *     responses:
 *       200:
 *         description: The list of services
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
 *                     $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the service
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of the service
 *               description:
 *                 type: string
 *                 description: A detailed description of the service
 *               event:
 *                 type: string
 *                 description: The ID of the event associated with this service
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - order
 *                     - title
 *                     - type
 *                     - duration
 *                   properties:
 *                     order:
 *                       type: integer
 *                       description: The order of the item in the service
 *                     title:
 *                       type: string
 *                       description: The title of the service item
 *                     type:
 *                       type: string
 *                       enum: [worship, prayer, sermon, offering, communion, announcement, scripture, testimony, other]
 *                       description: The type of service item
 *                     duration:
 *                       type: integer
 *                       description: The duration of the item in minutes
 *                     notes:
 *                       type: string
 *                       description: Additional notes for the service item
 *                     assignedTo:
 *                       type: string
 *                       description: The ID of the user assigned to this item
 *     responses:
 *       201:
 *         description: The service was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.route('/')
  .get(getServices)
  .post(createService);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The service ID
 *     responses:
 *       200:
 *         description: The service details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Service belongs to a different church
 *       404:
 *         description: The service was not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the service
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time of the service
 *               description:
 *                 type: string
 *                 description: A detailed description of the service
 *               event:
 *                 type: string
 *                 description: The ID of the event associated with this service
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the existing item (for updates)
 *                     order:
 *                       type: integer
 *                       description: The order of the item in the service
 *                     title:
 *                       type: string
 *                       description: The title of the service item
 *                     type:
 *                       type: string
 *                       enum: [worship, prayer, sermon, offering, communion, announcement, scripture, testimony, other]
 *                       description: The type of service item
 *                     duration:
 *                       type: integer
 *                       description: The duration of the item in minutes
 *                     notes:
 *                       type: string
 *                       description: Additional notes for the service item
 *                     assignedTo:
 *                       type: string
 *                       description: The ID of the user assigned to this item
 *     responses:
 *       200:
 *         description: The service was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Service belongs to a different church
 *       404:
 *         description: The service was not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The service ID
 *     responses:
 *       200:
 *         description: The service was deleted
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
 *         description: Forbidden - Service belongs to a different church
 *       404:
 *         description: The service was not found
 *       500:
 *         description: Server error
 */

router.route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

export default router; 