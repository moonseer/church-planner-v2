import { Router } from 'express';
import {
  getAllChurches,
  getChurch,
  createChurch,
  updateChurch,
  deleteChurch,
  hardDeleteChurch
} from '../controllers/church.controller';
import { validate, churchSchemas } from '../middleware/validationMiddleware';
import { authenticate, isChurchAdmin, isChurchOwner } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/churches
 * @desc    Get all churches with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', validate(churchSchemas.churchQuery, 'query'), getAllChurches);

/**
 * @route   GET /api/churches/:id
 * @desc    Get a single church by ID
 * @access  Public
 */
router.get('/:id', getChurch);

/**
 * @route   POST /api/churches
 * @desc    Create a new church
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, validate(churchSchemas.createChurch), createChurch);

/**
 * @route   PUT /api/churches/:id
 * @desc    Update a church
 * @access  Private (requires authentication and ownership/admin role)
 */
router.put('/:id', authenticate, isChurchAdmin, validate(churchSchemas.updateChurch), updateChurch);

/**
 * @route   DELETE /api/churches/:id
 * @desc    Soft delete a church (sets isActive to false)
 * @access  Private (requires authentication and ownership)
 */
router.delete('/:id', authenticate, isChurchOwner, deleteChurch);

/**
 * @route   DELETE /api/churches/:id/permanent
 * @desc    Hard delete a church (removes from database)
 * @access  Private (admin only)
 */
router.delete('/:id/permanent', authenticate, isChurchOwner, hardDeleteChurch);

export default router; 