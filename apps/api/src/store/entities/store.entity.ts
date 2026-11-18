import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity.js";
import { Tenant } from "../../tenant/entities/tenant.entity.js";

@Entity({ name: "stores" })
export class Store {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Tenant, t => t.store, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    tenant: Tenant

    @OneToMany(() => Product, p => p.store)
    products: Product[]
}