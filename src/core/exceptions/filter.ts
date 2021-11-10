import {
  Catch,
  ArgumentsHost,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  ValidationFailed,
  InvalidCredentials,
  GenericException,
  ModelNotFoundException,
} from '.';
import { Unauthorized } from './unauthorized';
const config = require('@tsmx/secure-config');

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  doNotReport(): Array<any> {
    return [
      NotFoundException,
      ValidationFailed,
      InvalidCredentials,
      GenericException,
      ModelNotFoundException,
      Unauthorized,
      UnauthorizedException,
      BadRequestException
    ];
  }

  catch(exception: any, host: ArgumentsHost) {
    console.error('ERRRR ==> ', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();

    if (exception instanceof ValidationFailed) {
      return response.error(
        {
          message: exception.message,
          errors: exception.getErrors(),
        },
        exception.getStatus(),
      );
    }

    let message =
      exception.message || 'Something went wrong. Please try again later.';

    const status = exception.status ? exception.status : 500;
    message = exception.status ? message : 'Internal Server Error';
    // let errors = [];
    // if (exception?.response?.message && (exception?.response?.message.length <= 1 || message) {
    //   errors.push(exception?.response?.message);
    // }

    let errors = [];
    if (typeof (exception?.response?.message) == 'string') {
      errors.push(exception?.response?.message);
      message = exception?.response?.description;
    }
    else
      errors = exception?.response?.message
    // let actualError = config.env.NODE_ENV != 'production' ? exception?.response : null;
    // let stack = config.env.NODE_ENV != 'production' ? exception?.stack : null;
    return response.status(status).json({
      message,
      errors: [...new Set(errors)]
    });
  }
}
