import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorFilters } from 'src/error/custom-exception';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let suggestion = undefined;

    if (exception instanceof CustomErrorFilters) {
      status = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || message;
      suggestion = response.suggestion;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object') {
        message = (response as any).message || message;
        suggestion = (response as any).suggestion;
      }
    } else {
      message = exception.message || message;
    }

    res.status(status).json({
      status: 'error',
      statusCode: status,
      error: {
        message,
        suggestion,
        timestamp: new Date().toISOString(),
        path: req.url,
      },
    });
  }
}
