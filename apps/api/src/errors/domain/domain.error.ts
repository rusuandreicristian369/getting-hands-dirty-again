export type DomainErrorKind = 'not_found' | 'invalid' | 'unavailable';

export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;
  abstract getCode(): string;

  getDetails(): Record<string, unknown> {
    return {};
  }
}
