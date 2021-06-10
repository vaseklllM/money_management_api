import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BankCard } from './bank-card.schema';

export type BankCardHistoryDocument = BankCardHistory & mongoose.Document;

@Schema()
export class BankCardHistory {
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: BankCard.name,
    required: true,
  })
  cards: mongoose.Types.ObjectId[];

  @Prop({ type: Date, required: true })
  date: Date;
}

export const BankCardHistorySchema =
  SchemaFactory.createForClass(BankCardHistory);
