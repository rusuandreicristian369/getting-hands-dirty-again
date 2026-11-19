import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "buyer" })
export class Buyer {
    @PrimaryGeneratedColumn("uuid")
    id: string;
}