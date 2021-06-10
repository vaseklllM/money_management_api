import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CurrencyAccount } from 'src/currency-accounts/schemas/currency-account.schema';
import { Banks } from './banks.schema';
import * as mongoose from 'mongoose';
import { Settings } from 'src/settings/schema/settings.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  nickname: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Date, required: true })
  registrationDate: Date;

  @Prop({ type: Banks })
  bankCards: Banks;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: CurrencyAccount.name,
    required: true,
  })
  currencyAccountsId: mongoose.Types.ObjectId[];

  @Prop({ type: Settings })
  settings: Settings;
}

export const UserSchema = SchemaFactory.createForClass(User);
