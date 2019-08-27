import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
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

  @ManyToOne(() => Store, { cascade: true, eager: true })
  store: Store;

  @Column()
  amount: string;

  // items: Item[]
}
