import mongoose from 'mongoose';
import { dbOperationsTotal } from './metrics';
import { logger } from './logger';

/**
 * Adds monitoring middleware to all Mongoose models to track database operations
 */
export const setupDbMonitoring = () => {
  // Add middleware for database operations
  mongoose.plugin(schema => {
    // Pre middleware
    schema.pre(['find', 'findOne', 'countDocuments'], function() {
      const modelName = this.model?.modelName || 'unknown';
      logger.debug(`DB query operation on ${modelName} started`);
    });

    schema.pre(['updateOne', 'updateMany'], function() {
      const modelName = this.model?.modelName || 'unknown';
      logger.debug(`DB update operation on ${modelName} started`);
    });

    schema.pre(['deleteOne', 'deleteMany'], function() {
      const modelName = this.model?.modelName || 'unknown';
      logger.debug(`DB delete operation on ${modelName} started`);
    });

    schema.pre('save', function(this: any) {
      const modelName = this.constructor?.modelName || 'unknown';
      logger.debug(`DB save operation on ${modelName} started`);
    });

    // Post middleware
    schema.post(['find', 'findOne', 'countDocuments'], function() {
      const modelName = this.model?.modelName || 'unknown';
      dbOperationsTotal.inc({ operation: 'query', model: modelName });
      logger.debug(`DB query operation on ${modelName} completed`);
    });

    schema.post(['updateOne', 'updateMany'], function() {
      const modelName = this.model?.modelName || 'unknown';
      dbOperationsTotal.inc({ operation: 'update', model: modelName });
      logger.debug(`DB update operation on ${modelName} completed`);
    });

    schema.post(['deleteOne', 'deleteMany'], function() {
      const modelName = this.model?.modelName || 'unknown';
      dbOperationsTotal.inc({ operation: 'delete', model: modelName });
      logger.debug(`DB delete operation on ${modelName} completed`);
    });

    schema.post('save', function(this: any) {
      const modelName = this.constructor?.modelName || 'unknown';
      dbOperationsTotal.inc({ operation: 'save', model: modelName });
      logger.debug(`DB save operation on ${modelName} completed`);
    });
  });

  // Listen for Mongoose connection events
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  
  logger.info('Database monitoring initialized');
}; 