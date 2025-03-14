import express from 'express';
import { 
  getTeamMembers,
  getTeamMember,
  addTeamMember,
  updateTeamMember,
  removeTeamMember
} from '../controllers/teamMemberController';
import { protect } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamMember:
 *       type: object
 *       required:
 *         - team
 *         - user
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the team member
 *         team:
 *           type: string
 *           description: Reference to the team this member belongs to
 *         user:
 *           type: string
 *           description: Reference to the user who is a member of the team
 *         role:
 *           type: string
 *           description: The role of the member in the team
 *         status:
 *           type: string
 *           description: The status of the member (active, inactive, pending)
 *           enum: [active, inactive, pending]
 *           default: active
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           description: The date the member joined the team
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         team: 60d21b4667d0d8992e610c85
 *         user: 60d21b4667d0d8992e610c85
 *         role: Worship Leader
 *         status: active
 *         joinedAt: 2023-01-15T19:08:24.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Team Members
 *   description: Team member management API
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/teams/{teamId}/members:
 *   get:
 *     summary: Returns the list of all members for a specific team
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The list of team members
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
 *                     $ref: '#/components/schemas/TeamMember'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add a member to a team
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
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
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: string
 *                 description: The user ID to add to the team
 *               role:
 *                 type: string
 *                 description: The role of the member in the team
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 default: active
 *                 description: The status of the member
 *     responses:
 *       201:
 *         description: The member was successfully added to the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Invalid input data or user already in team
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team or user not found
 *       500:
 *         description: Server error
 */

// Routes for /api/teams/:teamId/members
router.route('/')
  .get(getTeamMembers)
  .post(addTeamMember);

/**
 * @swagger
 * /api/teams/{teamId}/members/{id}:
 *   get:
 *     summary: Get a specific team member
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team member ID
 *     responses:
 *       200:
 *         description: The team member details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeamMember'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a team member
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 description: The role of the member in the team
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 description: The status of the member
 *     responses:
 *       200:
 *         description: The team member was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team member not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Remove a member from a team
 *     tags: [Team Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team member ID
 *     responses:
 *       200:
 *         description: The team member was removed
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
 *         description: Team member not found
 *       500:
 *         description: Server error
 */

// Routes for /api/team-members/:id
router.route('/:id')
  .get(getTeamMember)
  .put(updateTeamMember)
  .delete(removeTeamMember);

export default router; 