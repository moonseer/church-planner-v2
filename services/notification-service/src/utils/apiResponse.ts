import { Response } from 'express';

/**
 * Standardized API Response utility
 */
export class ApiResponse {
  /**
   * Send a success response
   * @param res Express response object
   * @param data Response data payload
   * @param statusCode HTTP status code (default: 200)
   */
  static success(res: Response, data: any, statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }

  /**
   * Send a created response (201)
   * @param res Express response object
   * @param data Response data payload
   */
  static created(res: Response, data: any): void {
    this.success(res, data, 201);
  }

  /**
   * Send an accepted response (202)
   * @param res Express response object
   * @param data Response data payload
   */
  static accepted(res: Response, data: any): void {
    this.success(res, data, 202);
  }

  /**
   * Send a no content response (204)
   * @param res Express response object
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send an error response
   * @param res Express response object
   * @param message Error message
   * @param statusCode HTTP status code (default: 500)
   * @param errors Additional error details
   */
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors: any = null
  ): void {
    const responseBody: any = {
      success: false,
      message,
    };

    if (errors) {
      responseBody.errors = errors;
    }

    res.status(statusCode).json(responseBody);
  }

  /**
   * Send a bad request error response (400)
   * @param res Express response object
   * @param message Error message
   * @param errors Additional error details
   */
  static badRequest(
    res: Response,
    message = 'Bad Request',
    errors: any = null
  ): void {
    this.error(res, message, 400, errors);
  }

  /**
   * Send an unauthorized error response (401)
   * @param res Express response object
   * @param message Error message
   */
  static unauthorized(
    res: Response,
    message = 'Unauthorized'
  ): void {
    this.error(res, message, 401);
  }

  /**
   * Send a forbidden error response (403)
   * @param res Express response object
   * @param message Error message
   */
  static forbidden(
    res: Response,
    message = 'Forbidden'
  ): void {
    this.error(res, message, 403);
  }

  /**
   * Send a not found error response (404)
   * @param res Express response object
   * @param message Error message
   */
  static notFound(
    res: Response,
    message = 'Resource not found'
  ): void {
    this.error(res, message, 404);
  }

  /**
   * Send a conflict error response (409)
   * @param res Express response object
   * @param message Error message
   */
  static conflict(
    res: Response,
    message = 'Conflict with current state'
  ): void {
    this.error(res, message, 409);
  }
} 