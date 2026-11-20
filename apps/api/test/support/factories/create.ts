import { DataSource } from "typeorm";
import { ProductFactory } from "./product.factory.js";
import { StoreFactory } from "./store.factory.js";
import { TenantFactory } from "./tenant.factory.js";

export const createFactories = (dataSource: DataSource) => {
    return {
        tenant: new TenantFactory(dataSource),
        store: new StoreFactory(dataSource),
        product: new ProductFactory(dataSource)
    }
}