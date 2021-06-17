import { Prop, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BankCard } from 'src/bank-cards/schema/bank-card.schema';

@Schema()
class BankCardUser {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

@Schema()
export class Bank {
  @Prop()
  token: string;

  @Prop()
  isValidToken: boolean;

  @Prop({ type: BankCardUser })
  user: BankCardUser;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: BankCard.name,
    required: true,
  })
  historyCards: mongoose.Types.ObjectId[];
}
