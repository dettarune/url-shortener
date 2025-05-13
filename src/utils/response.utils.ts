export function successResponse(
    message: string,
    data?: any
) {
  return {
    status: 'success',
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
  };
}
