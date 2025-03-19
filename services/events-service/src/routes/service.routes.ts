import express from 'express';
import * as serviceController from '../controllers/service.controller';
import { authenticate, isAdmin, isChurchAdmin } from '../middleware/authMiddleware';
import { validate, serviceSchemas } from '../middleware/validationMiddleware';

const router = express.Router();

// Base routes
router.route('/')
  .get(authenticate, validate(serviceSchemas.serviceQuery, 'query'), serviceController.getAllServices)
  .post(authenticate, isChurchAdmin, validate(serviceSchemas.createService), serviceController.createService);

// Single service routes
router.route('/:id')
  .get(authenticate, serviceController.getServiceById)
  .put(authenticate, isChurchAdmin, validate(serviceSchemas.updateService), serviceController.updateService)
  .delete(authenticate, isChurchAdmin, serviceController.deleteService);

// Church-specific services
router.route('/church/:churchId')
  .get(authenticate, validate(serviceSchemas.serviceQuery, 'query'), serviceController.getServicesByChurch);

// Service component routes
router.route('/:id/components')
  .post(authenticate, isChurchAdmin, serviceController.addServiceComponent);

router.route('/:id/components/:componentId')
  .put(authenticate, isChurchAdmin, serviceController.updateServiceComponent)
  .delete(authenticate, isChurchAdmin, serviceController.removeServiceComponent);

// Service schedule routes
router.route('/:id/schedules')
  .post(authenticate, isChurchAdmin, serviceController.addServiceSchedule);

router.route('/:id/schedules/:scheduleId')
  .put(authenticate, isChurchAdmin, serviceController.updateServiceSchedule)
  .delete(authenticate, isChurchAdmin, serviceController.removeServiceSchedule);

// Create events from service template
router.route('/:id/events')
  .post(authenticate, isChurchAdmin, serviceController.createEventsFromService);

export default router; 