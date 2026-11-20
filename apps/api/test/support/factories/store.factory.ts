import { FactorizedAttrs, Factory, SingleSubfactory } from "@jorgebodega/typeorm-factory";
import { DataSource } from "typeorm";
import { Store } from "../../../src/store/entities/store.entity.js";
import { TenantFactory } from "./tenant.factory.js";

export class StoreFactory extends Factory<Store> {
    protected entity = Store

    constructor(protected dataSource: DataSource) {
        super()
    }

    protected attrs(): FactorizedAttrs<Store> {
        return {
            tenant: new SingleSubfactory(new TenantFactory(this.dataSource))
        }
    }
}