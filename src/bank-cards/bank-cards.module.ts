import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { CurrencyModule } from 'src/currency/currency.module';
import { Currency, CurrencySchema } from 'src/currency/schemas/currency.schema';
import { BankCardsResolver } from './bank-cards.resolver';
import { BankCardsService } from './bank-cards.service';
import {
  BankCardHistory,
  BankCardHistorySchema,
} from './schema/bank-card-history.schema';
import { BankCard, BankCardSchema } from './schema/bank-card.schema';

@Module({
  providers: [BankCardsResolver, BankCardsService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BankCard.name, schema: BankCardSchema },
      { name: BankCardHistory.name, schema: BankCardHistorySchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
    forwardRef(() => CurrencyModule),
  ],
})
export class BankCardsModule {}
