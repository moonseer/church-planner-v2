import express from 'express';
import { 
  getChurches, 
  createChurch, 
  getChurch, 
  updateChurch, 
  deleteChurch 
} from '../controllers/churchController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '@shared/types/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Church:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - state
 *         - zip
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the church
 *         name:
 *           type: string
 *           description: The name of the church
 *         address:
 *           type: string
 *           description: The street address of the church
 *         city:
 *           type: string
 *           description: The city where the church is located
 *         state:
 *           type: string
 *           description: The state where the church is located
 *         zip:
 *           type: string
 *           description: The zip code of the church
 *         phone:
 *           type: string
 *           description: The contact phone number of the church
 *         email:
 *           type: string
 *           description: The contact email of the church
 *         website:
 *           type: string
 *           description: The website URL of the church
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the church was created
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         name: First Baptist Church
 *         address: 123 Main St
 *         city: Anytown
 *         state: CA
 *         zip: 12345
 *         phone: 555-123-4567
 *         email: info@firstbaptist.org
 *         website: https://www.firstbaptist.org
 *         createdAt: 2023-01-15T19:08:24.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Churches
 *   description: Church management API
 */

/**
 * @swagger
 * /api/churches:
 *   get:
 *     summary: Returns the list of all churches
 *     tags: [Churches]
 *     responses:
 *       200:
 *         description: The list of churches
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
 *                     $ref: '#/components/schemas/Church'
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new church
 *     tags: [Churches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Church'
 *     responses:
 *       201:
 *         description: The church was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Church'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */

/**
 * @route GET /api/churches
 * @desc Get all churches
 * @access Public
 */
router.route('/')
  .get(getChurches)
  .post(protect, authorize([UserRole.ADMIN]), createChurch);

/**
 * @swagger
 * /api/churches/{id}:
 *   get:
 *     summary: Get a church by ID
 *     tags: [Churches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The church ID
 *     responses:
 *       200:
 *         description: The church details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Church'
 *       404:
 *         description: The church was not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a church by ID
 *     tags: [Churches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The church ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Church'
 *     responses:
 *       200:
 *         description: The church was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Church'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: The church was not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a church by ID
 *     tags: [Churches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The church ID
 *     responses:
 *       200:
 *         description: The church was deleted
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
 *         description: Forbidden - Admin access required
 *       404:
 *         description: The church was not found
 *       500:
 *         description: Server error
 */

/**
 * @route GET /api/churches/:id
 * @desc Get church by ID
 * @access Public
 * 
 * @route PUT /api/churches/:id
 * @desc Update church
 * @access Private - Admin only
 * 
 * @route DELETE /api/churches/:id
 * @desc Delete church
 * @access Private - Admin only
 */
router.route('/:id')
  .get(getChurch)
  .put(protect, authorize([UserRole.ADMIN]), updateChurch)
  .delete(protect, authorize([UserRole.ADMIN]), deleteChurch);

export default router; 