import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "tenants" })
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: "varchar", length: 255 })
    name: string
}