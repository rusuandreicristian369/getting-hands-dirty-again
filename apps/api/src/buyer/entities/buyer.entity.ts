import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "buyer" })
export class Buyer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    // @OneToMany(() => Order, o => o.buyer)
    // orders: Order[]
}