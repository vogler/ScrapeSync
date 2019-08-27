import { CreateDateColumn, UpdateDateColumn, VersionColumn, Column } from 'typeorm';
import { fail } from 'assert';

// auto-generated meta information on save
export abstract class AutoMeta {
  @CreateDateColumn()
  create_date: Date; // insert date

  @UpdateDateColumn()
  update_date: Date; // update date

  @VersionColumn()
  version: number; // increments for each save
}

export enum Currency { EUR, USD }

export class Money {
  constructor(s: string) {
    var n = s;
    if (s != (n = s.replace('USD', '').replace('$', ''))) {
      this.currency = Currency.USD;
    } else if (s != (n = s.replace('EUR', '').replace('€', ''))) {
      this.currency = Currency.EUR;
    } else {
      fail('Unknown currency in ' + s);
    }
    this.amount = parseFloat(n.trim()); // TODO should use some int/decimal to store it
  }

  @Column()
  amount: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.EUR })
  currency: Currency
}
