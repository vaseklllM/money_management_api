import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { CurrencyHistory } from './currency-history.schema';

export type CurrencyDocument = Currency & Document;

@Schema()
export class Currency {
  @Prop({ required: true, unique: true })
  ISOCode: number;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: CurrencyHistory.name,
    required: true,
  })
  /** історія курсів валюти в гривнях */
  historyCourseInUAH: mongoose.Types.ObjectId[];
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
