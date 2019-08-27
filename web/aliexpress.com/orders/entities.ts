import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { AutoMeta } from '../../../util/db';

@Entity()
export class Store {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  url() {
    return `https://www.aliexpress.com/store/${this.id}`;
  }
}

@Entity()
export class Order extends AutoMeta {
  @PrimaryColumn()
  id: string;

  @Column()
  order_date: Date;

  @ManyToOne(() => Store, { cascade: true, eager: true })
  store: Store;

  @Column()
  amount: string; // currency shouldn't be a float

  // @Column()
  // currency: string; // sqlite does not support enum

  // items: Item[]
}
