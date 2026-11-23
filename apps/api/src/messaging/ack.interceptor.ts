import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { Channel, ConsumeMessage } from 'amqplib';
import { catchError, EMPTY, tap } from 'rxjs';
import { NonRetryableError } from './errors.js';

@Injectable()
export class AckInterceptor implements NestInterceptor {
  private readonly logger = new Logger(this.constructor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const rmq = context.switchToRpc().getContext<RmqContext>();

    const channel: Channel = rmq.getChannelRef();

    const message = rmq.getMessage() as ConsumeMessage;

    return next.handle().pipe(
      tap(() => channel.ack(message)),
      catchError((error) => {
        const retry = !(error instanceof NonRetryableError);

        this.logger.error(
          `${rmq.getPattern()} failed, ${retry ? 'will be retried' : 'dead-lettered'}: ${String(error)}`,
        );

        channel.reject(message, retry);

        return EMPTY;
      }),
    );
  }
}
