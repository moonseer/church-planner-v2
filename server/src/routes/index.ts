import express from 'express';
import authRoutes from './authRoutes';
import churchRoutes from './churchRoutes';

const router = express.Router();

// Set up routes
router.use('/api/auth', authRoutes);
router.use('/api/churches', churchRoutes);

export default router; 