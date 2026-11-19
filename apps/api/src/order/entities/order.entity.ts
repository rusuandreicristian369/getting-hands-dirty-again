import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "orders" })
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    productId: string;

    @Column({ type: "integer" })
    quantity: number;

    @CreateDateColumn()
    createdAt: Date;
}