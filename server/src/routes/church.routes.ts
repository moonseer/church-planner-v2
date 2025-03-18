import express from 'express';
import {
  getChurches,
  getChurch,
  createChurch,
  updateChurch,
  deleteChurch,
  getMyChurches,
  addMember,
  removeMember,
  addAdmin,
  removeAdmin
} from '../controllers/church.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getChurches);
router.get('/:id', getChurch);

// Protected routes
router.use(protect);
router.get('/my-churches', getMyChurches);
router.post('/', createChurch);
router.put('/:id', updateChurch);
router.delete('/:id', deleteChurch);

// Member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

// Admin management
router.post('/:id/admins', addAdmin);
router.delete('/:id/admins/:adminId', removeAdmin);

export default router; 