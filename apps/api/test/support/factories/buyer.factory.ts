import { faker } from "@faker-js/faker";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { DataSource } from "typeorm";
import { Buyer } from "../../../src/buyer/entities/buyer.entity.js";

export class BuyerFactory extends Factory<Buyer> {
    readonly entity = Buyer;

    constructor(protected dataSource: DataSource) {
        super()
    }

    protected attrs(): FactorizedAttrs<Buyer> {
        return {
            email: faker.internet.email(),
        }
    }
}