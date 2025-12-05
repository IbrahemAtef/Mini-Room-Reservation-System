import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ApiErrorResponse } from '../types/util.types';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';
import { ZodError } from 'zod';
import { isDevelopment } from '../utils/util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      success: false,
      statusCode: status,
      path: request.url,
      message: exception.message || 'something went wrong',
    };

    response.status(status).json(errorResponse);
  }
}

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    // console.log({ exception });

    const defaultError: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      path: req.url,
      message: 'Invalid data or operation. Please check your input',
    };
    console.log({ exception });

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          defaultError.statusCode = HttpStatus.CONFLICT;
          defaultError.message = exception.message;

          if (exception.meta && exception.meta.driverAdapterError) {
            const driverAdapterError = exception.meta.driverAdapterError;

            //? Object.values(driverAdapterError)[1], //result
            // {
            //   originalCode: '1062',
            //   originalMessage:
            //     "Duplicate entry 'ibrahim@gmail.com' for key 'users.users_email_key'",
            //   kind: 'UniqueConstraintViolation',
            //   constraint: { index: 'users_email_key' },
            // },

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            defaultError.message = isDevelopment
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                Object.values(driverAdapterError)[1]['originalMessage']
              : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                `Unique constraint failed on the field:${Object.values(driverAdapterError)[1]['constraint']['index']}`;

            //? Not working because target not exist
            // if (typeof exception.meta.target === 'string') {
            //
            //   defaultError.message = `Unique constraint failed on the field: ${exception.meta.target}`;
            //   defaultError.fields = [
            //     {
            //       field: exception.meta.target,
            //       message: defaultError.message,
            //     },
            //   ];
            // } else if (Array.isArray(exception.meta.target)) {
            //
            //   const fields = exception.meta.target.join(', ');
            //   defaultError.message = `Unique constraint failed on the fields: ${fields}`;
            //   defaultError.fields = exception.meta.target.map((field) => ({
            //     field: String(field),
            //     message: `Unique constraint failed on: ${String(field)}`,
            //   }));
            // }
          }
          break;
        case 'P2025':
          defaultError.statusCode = HttpStatus.NOT_FOUND;
          defaultError.message = 'Record not found';
          break;
        case 'P2003':
          defaultError.statusCode = HttpStatus.CONFLICT;
          defaultError.message = 'Invalid relation reference';
          break;
        case 'P2000':
          defaultError.statusCode = HttpStatus.BAD_REQUEST;
          defaultError.message = 'Value too long for column';
          break;
        case 'P2014':
          defaultError.statusCode = HttpStatus.CONFLICT;
          defaultError.message = 'Relation constraint failed';
          break;
        case 'P2024':
          defaultError.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          defaultError.message = 'Database connection timeout';
          break;
        default:
          defaultError.message = exception.message;
      }
    }

    return res.status(defaultError.statusCode).json(defaultError);
  }
}

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = HttpStatus.BAD_REQUEST;
    const errorResponse: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      success: false,
      statusCode: status,
      path: req.url,
      message: 'Validation failed',
      fields: exception.issues.map((iss) => ({
        field: iss.path.join('.'),
        message: isDevelopment ? iss.message : iss.code, // based on env we can switch to iss.message for more detailed info
      })),
    };

    res.status(status).json(errorResponse);
  }
}

// catch remaining unhandled exceptions
@Catch()
export class UncaughtExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    const errorResponse: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      success: false,
      statusCode: status,
      path: req.url,
      message,
    };

    return res.status(status).json(errorResponse);
  }
}
