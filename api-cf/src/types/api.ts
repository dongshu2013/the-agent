/**
 * Standard API Response Types
 */

// Base API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Error codes enum
export enum ApiErrorCode {
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

// Helper function to create success response
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

// Helper function to create error response
export function createErrorResponse(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
