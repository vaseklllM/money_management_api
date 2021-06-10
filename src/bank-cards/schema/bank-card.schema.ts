import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Currency } from 'src/currency/schemas/currency.schema';

export type BankCardDocument = BankCard & mongoose.Document;

@Schema()
export class BankCard {
  @Prop({ required: true })
  iban: string;

  @Prop()
  cardNumber?: string;

  @Prop({ required: true })
  balance: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency.name,
    required: true,
  })
  currencyId: mongoose.Types.ObjectId;
}

export const BankCardSchema = SchemaFactory.createForClass(BankCard);
