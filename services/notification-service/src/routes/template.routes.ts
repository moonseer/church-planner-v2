import express from 'express';
import * as templateController from '../controllers/template.controller';
import { authenticate, isAdmin, isChurchAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Template routes
router.route('/')
  .get(authenticate, templateController.getAllTemplates)
  .post(authenticate, isChurchAdmin, templateController.createTemplate);

// Single template routes
router.route('/:id')
  .get(authenticate, templateController.getTemplate)
  .put(authenticate, isChurchAdmin, templateController.updateTemplate)
  .delete(authenticate, isChurchAdmin, templateController.deleteTemplate);

// Render template route
router.route('/:id/render')
  .post(authenticate, templateController.renderTemplate);

export default router; 