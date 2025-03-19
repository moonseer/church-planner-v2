import { Router } from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  hardDeleteMember,
  addChurchRelationship,
  updateChurchRelationship,
  removeChurchRelationship,
  getMembersByChurch
} from '../controllers/member.controller';
import { validate, memberSchemas } from '../middleware/validationMiddleware';
import { authenticate, isProfileOwner, isAdmin } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route   GET /api/members
 * @desc    Get all members with pagination, filtering, and sorting
 * @access  Private
 */
router.get('/', authenticate, validate(memberSchemas.memberQuery, 'query'), getAllMembers);

/**
 * @route   GET /api/members/:id
 * @desc    Get a single member by ID
 * @access  Private (requires authentication and ownership or admin privileges)
 */
router.get('/:id', authenticate, getMember);

/**
 * @route   POST /api/members
 * @desc    Create a new member
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, validate(memberSchemas.createMember), createMember);

/**
 * @route   PUT /api/members/:id
 * @desc    Update a member
 * @access  Private (requires authentication and ownership or admin privileges)
 */
router.put('/:id', authenticate, isProfileOwner, validate(memberSchemas.updateMember), updateMember);

/**
 * @route   DELETE /api/members/:id
 * @desc    Soft delete a member (sets isActive to false)
 * @access  Private (requires authentication and ownership or admin privileges)
 */
router.delete('/:id', authenticate, isProfileOwner, deleteMember);

/**
 * @route   DELETE /api/members/:id/permanent
 * @desc    Hard delete a member (removes from database)
 * @access  Private (admin only)
 */
router.delete('/:id/permanent', authenticate, isAdmin, hardDeleteMember);

/**
 * @route   POST /api/members/:id/churches
 * @desc    Add a church relationship to a member
 * @access  Private (requires authentication and ownership or admin privileges)
 */
router.post(
  '/:id/churches',
  authenticate,
  isProfileOwner,
  validate(memberSchemas.addChurchRelationship),
  addChurchRelationship
);

/**
 * @route   PUT /api/members/:id/churches/:churchId
 * @desc    Update a church relationship for a member
 * @access  Private (requires authentication and ownership or admin privileges)
 */
router.put(
  '/:id/churches/:churchId',
  authenticate,
  isProfileOwner,
  validate(memberSchemas.updateChurchRelationship),
  updateChurchRelationship
);

/**
 * @route   DELETE /api/members/:id/churches/:churchId
 * @desc    Remove a church relationship from a member
 * @access  Private (requires authentication and ownership or admin privileges)
 */
router.delete('/:id/churches/:churchId', authenticate, isProfileOwner, removeChurchRelationship);

/**
 * @route   GET /api/members/church/:churchId
 * @desc    Get members by church ID
 * @access  Private (requires authentication)
 */
router.get('/church/:churchId', authenticate, validate(memberSchemas.memberQuery, 'query'), getMembersByChurch);

export default router; 