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

// All routes require authentication
router.use(protect);

// Routes for /api/teams/:teamId/members
router.route('/')
  .get(getTeamMembers)
  .post(addTeamMember);

// Routes for /api/team-members/:id
router.route('/:id')
  .get(getTeamMember)
  .put(updateTeamMember)
  .delete(removeTeamMember);

export default router; 