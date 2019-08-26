import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

// auto-generated meta information on save
export abstract class AutoMeta {
  @CreateDateColumn()
  create_date: Date; // insert date

  @UpdateDateColumn()
  update_date: Date; // update date

  @VersionColumn()
  version: number; // increments for each save
}
