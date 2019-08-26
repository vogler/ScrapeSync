import { Entity, Column, PrimaryColumn, JoinColumn } from 'typeorm';
import { AutoMeta } from '../../../util/db';

@Entity()
export class Order extends AutoMeta {
  @PrimaryColumn()
  id: string;

  @Column()
  order_time: string;

  // @One
  // @JoinColumn()
  // store: Store;

  @Column()
  amount: string;

  // items: Item[]
}

// @Entity()
// export class Store {
//   @PrimaryColumn()
//   id: number;

//   @Column()
//   name: string;

//   @Column()
//   url: string;
// }
