import { faker } from "@faker-js/faker";
import { FactorizedAttrs, Factory, SingleSubfactory } from "@jorgebodega/typeorm-factory";
import { DataSource } from "typeorm";
import { Product } from "../../../src/product/entities/product.entity.js";
import { StoreFactory } from "./store.factory.js";

export class ProductFactory extends Factory<Product> {
    protected entity = Product

    constructor(protected dataSource: DataSource) {
        super()
    }

    protected attrs(): FactorizedAttrs<Product> {
        return {
            stock: faker.number.int({ min: 0, max: 500 }),
            price: faker.number.int({ min: 0, max: 500 }),
            store: new SingleSubfactory(new StoreFactory(this.dataSource))
        }
    }
}