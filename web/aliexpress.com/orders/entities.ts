import { Entity, Column, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import { AutoMeta } from '../../../util/db';

@Entity()
export class Store {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;
}

@Entity()
export class Order extends AutoMeta {
  @PrimaryColumn()
  id: string;

  @Column()
  order_time: string;

  @OneToOne(() => Store, { cascade: true, eager: true })
  @JoinColumn()
  store: Store;

  @Column()
  amount: string;

  // items: Item[]
}
