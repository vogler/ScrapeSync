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

  // private _amount: string;
  @Column()
  public set amount_str(s: string) {
    console.log('setter', s);
    // this._amount = s;
    this.amount = 12.34;
  }

  @Column()
  amount: number; // currency shouldn't be a float

  // @Column()
  // currency: string; // sqlite does not support enum


  // items: Item[]
}
