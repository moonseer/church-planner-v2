import express from 'express';
import { 
  getTeams, 
  getTeam, 
  createTeam, 
  updateTeam, 
  deleteTeam 
} from '../controllers/teamController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - name
 *         - church
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the team
 *         name:
 *           type: string
 *           description: The name of the team
 *         description:
 *           type: string
 *           description: A detailed description of the team
 *         church:
 *           type: string
 *           description: Reference to the church this team belongs to
 *         leader:
 *           type: string
 *           description: Reference to the user who leads the team
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the team was created
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         name: Worship Team
 *         description: Team responsible for leading worship during services
 *         church: 60d21b4667d0d8992e610c85
 *         leader: 60d21b4667d0d8992e610c85
 *         createdAt: 2023-01-15T19:08:24.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management API
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Returns the list of all teams for the user's church
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of teams
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
 *                     $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the team
 *               description:
 *                 type: string
 *                 description: A detailed description of the team
 *               leader:
 *                 type: string
 *                 description: The ID of the user who will lead the team (defaults to current user if not provided)
 *     responses:
 *       201:
 *         description: The team was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.route('/')
  .get(getTeams)
  .post(createTeam);

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The team details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Team belongs to a different church
 *       404:
 *         description: The team was not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the team
 *               description:
 *                 type: string
 *                 description: A detailed description of the team
 *               leader:
 *                 type: string
 *                 description: The ID of the user who will lead the team
 *     responses:
 *       200:
 *         description: The team was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Team belongs to a different church
 *       404:
 *         description: The team was not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The team was deleted
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
 *         description: Forbidden - Team belongs to a different church
 *       404:
 *         description: The team was not found
 *       500:
 *         description: Server error
 */

router.route('/:id')
  .get(getTeam)
  .put(updateTeam)
  .delete(deleteTeam);

export default router; 