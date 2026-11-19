export type DomainErrorKind = "not_found" | "invalid"

export abstract class DomainError extends Error {
    abstract readonly kind: DomainErrorKind;
    abstract getCode(): string;

    getDetails(): Record<string, unknown> { return {} }
}
