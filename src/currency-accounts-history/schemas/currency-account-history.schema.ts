import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CurrencyAccountHistoryDocument = CurrencyAccountHistory & Document;

@Schema()
export class CurrencyAccountHistory {
  /** Заголовок операції */
  @Prop({ required: true })
  title: string;

  /** дата операції */
  @Prop({ type: Date, required: true })
  date: Date;

  /** сума покупки */
  @Prop({ required: true })
  value: number;

  /** value рахунка після здійснення цієї операції */
  @Prop({ required: true })
  currencyAccountValue: number;
}

export const CurrencyAccountHistorySchema = SchemaFactory.createForClass(
  CurrencyAccountHistory,
);
