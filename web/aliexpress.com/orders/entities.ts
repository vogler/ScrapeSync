import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMeta, Money } from '../../../util/db';

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

  @Column(() => Money)
  price: Money;

  @OneToMany(() => Item, item => item.order, { cascade: true, eager: true })
  items: Item[]
}

// @Entity()
// export class Product {
//   @PrimaryColumn()
//   id: string;

//   @Column()
//   name: string; // I assume names can change...

//   // store
//   // variants
//   // description
//   // price history?
// }

// Order Item could extend Product (advantage: list all orders for a product), but better to have a snapshot with all data in case e.g. product names change
@Entity()
export class Item {
  @ManyToOne(() => Order, order => order.items)
  order: Order;

  // Use orderId+productId as a composite primary key. PrimaryColumn decoration on ManyToOne directly does not work; need to list the resulting orderId explicitly.
  // @PrimaryColumn()
  // orderId: string;
  // This fails on non-empty DB with
  // 1) orderId being NULL
  // 2) orderId and productId being not UNIQUE if I set orderId explicitly
  // see https://github.com/typeorm/typeorm/issues/3238

  // Workaround: manual id = orderId+productId. TODO remove this hack once typeorm fixes composite primary keys.
  @PrimaryColumn()
  id: string;

  // With just productId as PK, different order items for the same productId would overwrite each other.
  @Column()
  productId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  variant: string;

  @Column(() => Money)
  price: Money;

  @Column()
  quantity: number;

  @Column()
  status: string;

  @Column()
  url: string; // could be generated from id (see url_gen), but original also includes item name (not really needed but hey)

  url_gen() {
    return `https://www.aliexpress.com/item/${this.productId}.html`;
  }

  @Column()
  img_url: string;
}
