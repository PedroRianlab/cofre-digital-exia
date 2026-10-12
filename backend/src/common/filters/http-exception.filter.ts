import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ExceptionBody = {
  message?: string | string[];
  fields?: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionBody = isHttpException ? exception.getResponse() : undefined;
    const details = this.getDetails(exceptionBody);

    response.status(statusCode).json({
      statusCode,
      message:
        statusCode === 500 ? 'Erro interno do servidor' : details.message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(statusCode === 400 && details.fields
        ? { fields: details.fields }
        : {}),
    });
  }

  private getDetails(body: string | object | undefined): ExceptionBody {
    if (typeof body === 'string') {
      return { message: body };
    }

    if (body && 'message' in body) {
      return body as ExceptionBody;
    }

    return { message: 'Erro na requisicao' };
  }
}
