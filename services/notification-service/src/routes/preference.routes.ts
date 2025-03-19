import express from 'express';
import * as preferenceController from '../controllers/preference.controller';
import { authenticate, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// User preference routes
router.route('/user/:userId')
  .get(authenticate, preferenceController.getUserPreferences)
  .put(authenticate, preferenceController.updateUserPreferences);

// Category preference routes
router.route('/user/:userId/category/:category')
  .put(authenticate, preferenceController.updateCategoryPreference);

// Device token routes
router.route('/user/:userId/device')
  .post(authenticate, preferenceController.addDeviceToken);

router.route('/user/:userId/device/:deviceId')
  .delete(authenticate, preferenceController.removeDeviceToken);

export default router; 