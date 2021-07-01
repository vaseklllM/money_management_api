import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import {
  CurrencyAccountHistory,
  CurrencyAccountHistorySchema,
} from 'src/currency-accounts-history/schemas/currency-account-history.schema';
import { CurrencyModule } from 'src/currency/currency.module';
import { CurrencyAccountsResolver } from './currency-accounts.resolver';
import { CurrencyAccountsService } from './currency-accounts.service';
import {
  CurrencyAccount,
  CurrencyAccountSchema,
} from './schemas/currency-account.schema';

@Module({
  providers: [CurrencyAccountsResolver, CurrencyAccountsService],
  imports: [
    MongooseModule.forFeature([
      { name: CurrencyAccount.name, schema: CurrencyAccountSchema },
      { name: User.name, schema: UserSchema },
      {
        name: CurrencyAccountHistory.name,
        schema: CurrencyAccountHistorySchema,
      },
    ]),
    forwardRef(() => CurrencyModule),
  ],
})
export class CurrencyAccountsModule {}
