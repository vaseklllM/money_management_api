import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CurrencyAccountHistory } from 'src/currency-accounts-history/schemas/currency-account-history.schema';
import { Currency } from 'src/currency/schemas/currency.schema';

export type CurrencyAccountDocument = CurrencyAccount & Document;

@Schema()
export class CurrencyAccount {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Currency.name,
    required: true,
  })
  currencyId: mongoose.Types.ObjectId;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: CurrencyAccountHistory.name,
    required: true,
  })
  historyId: mongoose.Types.ObjectId[];
}

export const CurrencyAccountSchema =
  SchemaFactory.createForClass(CurrencyAccount);
