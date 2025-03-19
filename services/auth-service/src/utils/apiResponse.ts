import { Response } from 'express';

/**
 * Standardized API response utility
 */
export class ApiResponse {
  /**
   * Send a success response (200 OK)
   */
  static success<T>(res: Response, data: T, message?: string): Response {
    return res.status(200).json({
      success: true,
      message: message || 'Operation successful',
      data
    });
  }

  /**
   * Send a created response (201 Created)
   */
  static created<T>(res: Response, data: T, message?: string): Response {
    return res.status(201).json({
      success: true,
      message: message || 'Resource created successfully',
      data
    });
  }

  /**
   * Send a no content response (204 No Content)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a bad request error response (400 Bad Request)
   */
  static badRequest(res: Response, message?: string | string[]): Response {
    return res.status(400).json({
      success: false,
      error: message || 'Bad request'
    });
  }

  /**
   * Send an unauthorized error response (401 Unauthorized)
   */
  static unauthorized(res: Response, message?: string): Response {
    return res.status(401).json({
      success: false,
      error: message || 'Unauthorized'
    });
  }

  /**
   * Send a forbidden error response (403 Forbidden)
   */
  static forbidden(res: Response, message?: string): Response {
    return res.status(403).json({
      success: false,
      error: message || 'Forbidden'
    });
  }

  /**
   * Send a not found error response (404 Not Found)
   */
  static notFound(res: Response, message?: string): Response {
    return res.status(404).json({
      success: false,
      error: message || 'Resource not found'
    });
  }

  /**
   * Send a conflict error response (409 Conflict)
   */
  static conflict(res: Response, message?: string): Response {
    return res.status(409).json({
      success: false,
      error: message || 'Conflict with existing resource'
    });
  }

  /**
   * Send a too many requests error response (429 Too Many Requests)
   */
  static tooManyRequests(res: Response, message?: string): Response {
    return res.status(429).json({
      success: false,
      error: message || 'Too many requests'
    });
  }

  /**
   * Send a server error response (500 Internal Server Error)
   */
  static serverError(res: Response, message?: string): Response {
    return res.status(500).json({
      success: false,
      error: message || 'Internal server error'
    });
  }
} 