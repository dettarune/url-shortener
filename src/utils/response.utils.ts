import { Request } from 'express';

export function successResponse(
    message: string,
    data?: any
) {
  return {
    status: 'success',
    data: data,
    message: message,
    timestamp: new Date().toISOString(),
  };
}
