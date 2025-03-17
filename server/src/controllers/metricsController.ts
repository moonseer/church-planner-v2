import { Request, Response } from 'express';
import { logger } from '../utils/logger';

interface ClientMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

/**
 * @desc    Receive client-side metrics
 * @route   POST /api/metrics/client
 * @access  Public
 */
export const receiveClientMetrics = async (req: Request, res: Response) => {
  try {
    // Extract metrics from request body
    const metric = req.body as ClientMetric;
    
    // Log the metric
    logger.info('Client metric received', {
      metric_name: metric.name,
      metric_value: metric.value,
      url: metric.url,
      user_agent: req.headers['user-agent'],
      ip: req.ip,
    });
    
    // Could store metrics in a database or send to a metrics collection system
    
    // Send a simple response
    res.status(204).end();
  } catch (error) {
    logger.error('Error processing client metric', { error });
    res.status(500).json({ success: false, message: 'Error processing metric' });
  }
}; 