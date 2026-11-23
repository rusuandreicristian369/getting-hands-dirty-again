import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { TracerService } from '@nestjs/observe';
import { Response } from 'express';
import { DomainError, DomainErrorKind } from './domain.error.js';

const STATUS: Record<DomainErrorKind, HttpStatus> = {
  not_found: HttpStatus.NOT_FOUND,
  invalid: HttpStatus.UNPROCESSABLE_ENTITY,
  unavailable: HttpStatus.SERVICE_UNAVAILABLE,
};

@Catch(DomainError)
export class DomainFilter implements ExceptionFilter {
  constructor(private readonly tracer: TracerService) {}

  catch(exception: DomainError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const status = STATUS[exception.kind];

    http.getResponse<Response>().status(status).json({
      code: exception.getCode(),
      message: exception.message,
      details: exception.getDetails(),
      requestId: this.tracer.currentTraceId(),
    });
  }
}
