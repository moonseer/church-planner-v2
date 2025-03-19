import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import NotificationTemplate, { INotificationTemplate, TemplateCategory } from '../models/NotificationTemplate';
import { NotificationType } from '../models/Notification';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorMiddleware';
import templateRenderer from '../utils/templateRenderer';

/**
 * Get all notification templates
 */
export const getAllTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      type, 
      category, 
      isActive, 
      churchId, 
      isDefault 
    } = req.query;
    
    // Convert string parameters to their appropriate types
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Build filter
    const filter: any = {};
    
    // Add optional filters
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (churchId) {
      if (churchId === 'null') {
        // Find templates without churchId (global templates)
        filter.churchId = { $exists: false };
      } else if (mongoose.Types.ObjectId.isValid(churchId.toString())) {
        filter.churchId = new mongoose.Types.ObjectId(churchId.toString());
      }
    }
    
    if (isDefault !== undefined) {
      filter.isDefault = isDefault === 'true';
    }
    
    // Get templates with pagination
    const templates = await NotificationTemplate.find(filter)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limitNumber);
    
    // Get total count
    const total = await NotificationTemplate.countDocuments(filter);
    
    logger.debug(`Retrieved ${templates.length} notification templates`);
    
    ApiResponse.success(res, {
      templates,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    logger.error('Error retrieving notification templates', { error });
    next(new AppError('Error retrieving notification templates', 500));
  }
};

/**
 * Get a single notification template by ID
 */
export const getTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid template ID', 400));
      return;
    }
    
    // Find template
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      next(new AppError('Template not found', 404));
      return;
    }
    
    // Check if user is authorized to access this template
    if (template.churchId && 
        template.churchId.toString() !== req.user?.churchId && 
        req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to access this template', 403));
      return;
    }
    
    logger.debug(`Retrieved template ${id}`);
    
    ApiResponse.success(res, template);
  } catch (error) {
    logger.error('Error retrieving template', { error, id: req.params.id });
    next(new AppError('Error retrieving template', 500));
  }
};

/**
 * Create a new notification template
 */
export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, type, category, subject, content, html, churchId } = req.body;
    
    // Validate required fields
    if (!name || !type || !category || !subject || !content) {
      next(new AppError('Missing required fields: name, type, category, subject, content', 400));
      return;
    }
    
    // Check if notification type is valid
    if (!Object.values(NotificationType).includes(type)) {
      next(new AppError(`Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`, 400));
      return;
    }
    
    // Check if template category is valid
    if (!Object.values(TemplateCategory).includes(category)) {
      next(new AppError(`Invalid template category. Must be one of: ${Object.values(TemplateCategory).join(', ')}`, 400));
      return;
    }
    
    // Check if a template with the same name and type already exists for this church
    const existingTemplate = await NotificationTemplate.findOne({
      name,
      type,
      ...(churchId ? { churchId: new mongoose.Types.ObjectId(churchId) } : {}),
    });
    
    if (existingTemplate) {
      next(new AppError('A template with this name and type already exists for this church', 409));
      return;
    }
    
    // Extract variables from template content and HTML
    const contentVariables = templateRenderer.extractVariables(content);
    const htmlVariables = html ? templateRenderer.extractVariables(html) : [];
    
    // Merge variables
    const variables = Array.from(new Set([...contentVariables, ...htmlVariables]));
    
    // Create template
    const template = await NotificationTemplate.create({
      name,
      type,
      category,
      subject,
      content,
      html,
      variables,
      churchId: churchId ? new mongoose.Types.ObjectId(churchId) : undefined,
      isDefault: req.body.isDefault || false,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      metadata: req.body.metadata || {},
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });
    
    logger.info(`Template created: ${template._id}`);
    
    ApiResponse.created(res, template);
  } catch (error) {
    logger.error('Error creating template', { error, body: req.body });
    next(new AppError('Error creating template', 500));
  }
};

/**
 * Update a notification template
 */
export const updateTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid template ID', 400));
      return;
    }
    
    // Find template
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      next(new AppError('Template not found', 404));
      return;
    }
    
    // Check if user is authorized to update this template
    if (template.churchId && 
        template.churchId.toString() !== req.user?.churchId && 
        req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to update this template', 403));
      return;
    }
    
    // Only system admin can update default templates
    if (template.isDefault && req.user?.role !== 'admin') {
      next(new AppError('Only system administrators can update default templates', 403));
      return;
    }
    
    // Update allowed fields only
    const allowedUpdates = ['name', 'description', 'subject', 'content', 'html', 'isActive', 'metadata'];
    const updates: any = {};
    
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    // Update updatedBy field
    updates.updatedBy = req.user?.id;
    
    // Re-extract variables if content or HTML changed
    if (updates.content || updates.html) {
      const contentVariables = templateRenderer.extractVariables(updates.content || template.content);
      const htmlVariables = (updates.html || template.html) 
        ? templateRenderer.extractVariables(updates.html || template.html) 
        : [];
        
      // Merge variables
      updates.variables = Array.from(new Set([...contentVariables, ...htmlVariables]));
    }
    
    // Update template
    const updatedTemplate = await NotificationTemplate.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    logger.info(`Template updated: ${id}`);
    
    ApiResponse.success(res, updatedTemplate);
  } catch (error) {
    logger.error('Error updating template', { error, id: req.params.id });
    next(new AppError('Error updating template', 500));
  }
};

/**
 * Delete a notification template
 */
export const deleteTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid template ID', 400));
      return;
    }
    
    // Find template
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      next(new AppError('Template not found', 404));
      return;
    }
    
    // Check if user is authorized to delete this template
    if (template.churchId && 
        template.churchId.toString() !== req.user?.churchId && 
        req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to delete this template', 403));
      return;
    }
    
    // Prevent deletion of default templates
    if (template.isDefault) {
      next(new AppError('Default templates cannot be deleted', 403));
      return;
    }
    
    // Delete template
    await template.deleteOne();
    
    logger.info(`Template deleted: ${id}`);
    
    ApiResponse.success(res, { message: 'Template deleted successfully' });
  } catch (error) {
    logger.error('Error deleting template', { error, id: req.params.id });
    next(new AppError('Error deleting template', 500));
  }
};

/**
 * Render a template with provided data
 */
export const renderTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    
    // Validate request
    if (!id || !data) {
      next(new AppError('Template ID and data are required', 400));
      return;
    }
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid template ID', 400));
      return;
    }
    
    // Find template
    const template = await NotificationTemplate.findById(id);
    
    if (!template) {
      next(new AppError('Template not found', 404));
      return;
    }
    
    // Check if user is authorized to access this template
    if (template.churchId && 
        template.churchId.toString() !== req.user?.churchId && 
        req.user?.role !== 'admin') {
      next(new AppError('You are not authorized to access this template', 403));
      return;
    }
    
    // Validate variables
    const validation = templateRenderer.validateVariables(template.variables, data);
    
    if (!validation.valid) {
      next(new AppError(`Missing required variables: ${validation.missing.join(', ')}`, 400));
      return;
    }
    
    // Render template
    const renderedContent = templateRenderer.render(template.content, data);
    const renderedHtml = template.html ? templateRenderer.render(template.html, data) : undefined;
    const renderedSubject = templateRenderer.render(template.subject, data);
    
    logger.debug(`Template ${id} rendered successfully`);
    
    ApiResponse.success(res, {
      subject: renderedSubject,
      content: renderedContent,
      html: renderedHtml,
    });
  } catch (error) {
    logger.error('Error rendering template', { error, id: req.params.id });
    next(new AppError('Error rendering template', 500));
  }
}; 