import { DomainError, DomainErrorKind } from '../errors/domain/domain.error.js';

export class CheckoutUnavailableError extends DomainError {
  kind: DomainErrorKind = 'unavailable';

  constructor(options?: ErrorOptions) {
    super('Checkout is unavailable, try again.', options);
  }

  getCode(): string {
    return 'CHECKOUT_UNAVAILABLE';
  }
}
