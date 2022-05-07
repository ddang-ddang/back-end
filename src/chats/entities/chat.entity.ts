import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { prop } from '@typegoose/typegoose';

export class Chat {
  @prop({
    required: [true, 'Message is required'],
  })
  message: string;

  constructor(chat?: Partial<Chat>) {
    Object.assign(this, chat);
  }
}
