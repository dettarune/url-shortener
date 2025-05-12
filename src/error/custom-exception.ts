import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseDto } from 'src/dto/error.dto';

export class CustomErrorFilters extends HttpException {
  constructor({
    statusCode,
    message,
    path,
    suggestion,
  }: {
    statusCode: number;
    message: string;
    path?: string;
    suggestion?: string;
  }) {

    const errorResponse: ErrorResponseDto = {
      status: 'error',
      statusCode,
      message,
      path,
      suggestion,
      timestamp: new Date().toISOString(),
    };

    // Memanggil constructor dari HttpException dengan error response yang telah disiapkan
    super(errorResponse, statusCode);
  }
}
