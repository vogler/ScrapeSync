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
  @PrimaryGeneratedColumn('uuid') // composite primary keys are supported, but PrimaryColumn on both order and productId broke the ManyToOne and led to 'Data type "Order" in "Item.order" is not supported by "sqlite" database'. TODO this always generates a new ID!
  id: string;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

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
