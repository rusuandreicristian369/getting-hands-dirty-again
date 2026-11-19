import { Buyer } from "../buyer/entities/buyer.entity.js";
import { Order } from "../order/entities/order.entity.js";
import { Product } from "../product/entities/product.entity.js";
import { Store } from "../store/entities/store.entity.js";
import { Tenant } from "../tenant/entities/tenant.entity.js";

export const entities = [Tenant, Store, Product, Order, Buyer]