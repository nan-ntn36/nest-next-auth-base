import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'Error';
    let errors: Record<string, string>[] | undefined;
    //Nếu là HttpException (các lỗi như BadRequest, Unauthorized, ...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      }

      if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, any>;
        if (Array.isArray(r.message)) {
          // message có dạng ["email must be an email", "password must be at least 8 characters"]
          errors = r.message.map((msg) => {
            const [field, ...rest] = msg.split(' ');
            return { field, error: rest.join(' ') };
          });
          message = 'Validation failed';
          errorName = 'Bad Request';
        }
      }

      if (exception instanceof Error) {
        // 🧩 Nếu là lỗi hệ thống hoặc throw Error()
        message = exception.message;
        errorName = exception.name;
      }
    }
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(`[ERROR] ${request.method} ${request.url}`, exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errorName,
      ...(errors && { errors }),
    });
  }
}
