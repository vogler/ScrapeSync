import {Entity, Column, PrimaryColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, VersionColumn} from 'typeorm';

export abstract class Meta {
  @CreateDateColumn()
  create_date: Date; // auto: insert date

  @UpdateDateColumn()
  update_date: Date; // auto: update date

  @VersionColumn()
  version: number; // auto: increments for each save
}
