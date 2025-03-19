import { Response } from 'express';

/**
 * ApiResponse - Utility class for standardized API responses
 * 
 * This class provides static methods to format consistent API responses
 * across the application with standard status codes and response formats.
 */
export class ApiResponse {
  /**
   * Success response - 200 OK
   */
  static success(res: Response, data: any, message: string = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Created response - 201 Created
   */
  static created(res: Response, data: any, message: string = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  /**
   * No content response - 204 No Content
   */
  static noContent(res: Response) {
    return res.status(204).send();
  }

  /**
   * Bad request response - 400 Bad Request
   */
  static badRequest(res: Response, message: string = 'Bad request', errors?: any) {
    const response: any = {
      success: false,
      message
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return res.status(400).json(response);
  }

  /**
   * Unauthorized response - 401 Unauthorized
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message
    });
  }

  /**
   * Forbidden response - 403 Forbidden
   */
  static forbidden(res: Response, message: string = 'Forbidden access') {
    return res.status(403).json({
      success: false,
      message
    });
  }

  /**
   * Not found response - 404 Not Found
   */
  static notFound(res: Response, message: string = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message
    });
  }

  /**
   * Conflict response - 409 Conflict
   */
  static conflict(res: Response, message: string = 'Conflict with existing resource') {
    return res.status(409).json({
      success: false,
      message
    });
  }

  /**
   * Too many requests response - 429 Too Many Requests
   */
  static tooManyRequests(res: Response, message: string = 'Too many requests, please try again later') {
    return res.status(429).json({
      success: false,
      message
    });
  }

  /**
   * Server error response - 500 Internal Server Error
   */
  static serverError(res: Response, message: string = 'Internal server error', error?: any) {
    const response: any = {
      success: false,
      message
    };

    // Include error details in development
    if (process.env.NODE_ENV !== 'production' && error) {
      response.error = error.toString();
      if (error.stack) {
        response.stack = error.stack;
      }
    }

    return res.status(500).json(response);
  }

  /**
   * Service unavailable response - 503 Service Unavailable
   */
  static serviceUnavailable(res: Response, message: string = 'Service temporarily unavailable') {
    return res.status(503).json({
      success: false,
      message
    });
  }
} 