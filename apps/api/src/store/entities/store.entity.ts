import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "../../tenant/entities/tenant.entity.js";

@Entity({ name: "stores" })
export class Store {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Tenant, t => t.store, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: "tenant_id"
    })
    tenant: Tenant
}