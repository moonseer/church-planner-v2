import express from 'express';
import { 
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getServices)
  .post(createService);

router.route('/:id')
  .get(getService)
  .put(updateService)
  .delete(deleteService);

export default router; 