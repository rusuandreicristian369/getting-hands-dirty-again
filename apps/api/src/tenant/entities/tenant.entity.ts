import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Store } from '../../store/entities/store.entity.js';

@Entity({ name: "tenants" })
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: "varchar", length: 255 })
    name: string

    @OneToOne(() => Store, s => s.tenant, { cascade: true })
    store?: Store | null
}