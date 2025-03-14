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

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeam)
  .put(updateTeam)
  .delete(deleteTeam);

export default router; 