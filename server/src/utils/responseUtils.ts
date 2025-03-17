import { Response } from 'express';
import { 
  ApiSuccessResponse, 
  ApiErrorResponse,
  HttpStatus
} from '@shared/types/api';

/**
 * Send a success response with the appropriate status code
 * @param res Express Response object
 * @param data The data to send in the response
 * @param statusCode HTTP status code (defaults to 200 OK)
 * @param count Optional count for collections
 */
export const sendSuccessResponse = <T>(
  res: Response, 
  data: T, 
  statusCode = HttpStatus.OK,
  count?: number
): void => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(count !== undefined && { count })
  };
  
  res.status(statusCode).json(response);
};

/**
 * Send an error response with the appropriate status code
 * @param res Express Response object
 * @param error Error message or array of error messages
 * @param statusCode HTTP status code (defaults to 500 INTERNAL_SERVER_ERROR)
 */
export const sendErrorResponse = (
  res: Response,
  error: string | string[],
  statusCode = HttpStatus.INTERNAL_SERVER_ERROR
): void => {
  const response: ApiErrorResponse = {
    success: false,
    error,
    statusCode
  };
  
  res.status(statusCode).json(response);
};

/**
 * Process errors from try/catch blocks and send appropriate error response
 * @param res Express Response object
 * @param error The caught error
 */
export const handleError = (res: Response, error: unknown): void => {
  if (error instanceof Error) {
    // Handle validation errors (MongoDB/Mongoose)
    if (error.name === 'ValidationError' && 'errors' in (error as any)) {
      const messages = Object.values((error as any).errors).map(
        (err: any) => err.message
      );
      sendErrorResponse(res, messages, HttpStatus.BAD_REQUEST);
      return;
    }
    
    // Handle duplicate key errors (MongoDB/Mongoose)
    if (error.name === 'MongoError' && (error as any).code === 11000) {
      sendErrorResponse(res, 'Duplicate field value entered', HttpStatus.CONFLICT);
      return;
    }
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      sendErrorResponse(res, 'Invalid token', HttpStatus.UNAUTHORIZED);
      return;
    }
    
    // Handle token expiration
    if (error.name === 'TokenExpiredError') {
      sendErrorResponse(res, 'Token expired', HttpStatus.UNAUTHORIZED);
      return;
    }
    
    // Generic error with message
    sendErrorResponse(res, error.message);
    return;
  }
  
  // Handle unknown errors
  sendErrorResponse(res, 'Server error');
}; 