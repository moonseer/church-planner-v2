import express from 'express';
import { 
  getChurches, 
  createChurch, 
  getChurch, 
  updateChurch, 
  deleteChurch 
} from '../controllers/churchController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @desc    Get all churches & Create new church
// @route   GET /api/churches & POST /api/churches
// @access  Public (GET) & Private/Admin (POST)
router.route('/')
  .get(getChurches)
  .post(protect, authorize('admin'), createChurch);

// @desc    Get single church, Update church, Delete church
// @route   GET, PUT, DELETE /api/churches/:id
// @access  Public (GET) & Private/Admin (PUT, DELETE)
router.route('/:id')
  .get(getChurch)
  .put(protect, authorize('admin'), updateChurch)
  .delete(protect, authorize('admin'), deleteChurch);

export default router; 