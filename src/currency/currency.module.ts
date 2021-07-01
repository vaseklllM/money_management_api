import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyResolver } from './currency.resolver';
import { CurrencyService } from './currency.service';
import {
  CurrencyHistory,
  CurrencyHistorySchema,
} from './schemas/currency-history.schema';
import { Currency, CurrencySchema } from './schemas/currency.schema';

@Module({
  providers: [CurrencyResolver, CurrencyService],
  imports: [
    MongooseModule.forFeature([
      { name: CurrencyHistory.name, schema: CurrencyHistorySchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  exports: [CurrencyService],
})
export class CurrencyModule {}
