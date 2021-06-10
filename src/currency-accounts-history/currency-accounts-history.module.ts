import { Module } from '@nestjs/common';
import { CurrencyAccountsHistoryResolver } from './currency-accounts-history.resolver';
import { CurrencyAccountsHistoryService } from './currency-accounts-history.service';

@Module({
  providers: [CurrencyAccountsHistoryResolver, CurrencyAccountsHistoryService],
  imports: [],
})
export class CurrencyAccountsHistoryModule {}
