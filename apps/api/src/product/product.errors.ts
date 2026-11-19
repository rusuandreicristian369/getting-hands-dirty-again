import { DomainError, DomainErrorKind } from "../errors/domain/domain.error.js"

export class ProductCouldNotBeReservedError extends DomainError {
    constructor() {
        super("Could not reserve.")
    }

    kind: DomainErrorKind = "invalid"

    getCode() {
        return "PRODUCT_COULD_NOT_BE_RESERVED"
    }
}