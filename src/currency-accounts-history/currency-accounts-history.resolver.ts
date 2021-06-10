import { Resolver } from '@nestjs/graphql';
import { CurrencyAccountsHistoryService } from './currency-accounts-history.service';

@Resolver()
export class CurrencyAccountsHistoryResolver {
  constructor(private readonly service: CurrencyAccountsHistoryService) {}
}
