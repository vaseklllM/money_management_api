import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyHistoryDocument = CurrencyHistory & Document;

@Schema()
export class CurrencyHistory {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  price: number;
}

export const CurrencyHistorySchema =
  SchemaFactory.createForClass(CurrencyHistory);
