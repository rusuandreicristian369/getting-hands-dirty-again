import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from "typeorm";
import { Store } from "../../store/entities/store.entity.js";

@Entity({ name: "products" })
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Store, s => s.products, {
        nullable: true,
        onDelete: "CASCADE"
    })
    @JoinColumn()
    store: Store

    @Column({ type: "integer" })
    stock: number;
}