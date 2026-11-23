import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column({ type: 'integer' })
  quantity: number;

  // @ManyToOne(() => Buyer, b => b.orders, { nullable: false })
  // buyer: Relation<Buyer>

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.AWAITING_PAYMENT,
  })
  status: OrderStatus;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'integer', unsigned: true })
  amount: number;

  @Column({ type: 'varchar', nullable: true })
  checkoutSessionId?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
