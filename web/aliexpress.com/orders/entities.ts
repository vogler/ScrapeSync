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

  set amount_str(s: string) {
    console.log('amount_str', s);
    this.amount = 123;
    this.currency = 'USD';
  }
  @Column()
  get amount_str(): string {
    return this.amount_str;
  }

  @Column()
  amount: number;

  @Column()
  currency: string; // sqlite does not support enum


  // items: Item[]
}
