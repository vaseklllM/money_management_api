import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrencyService } from './currency.service';
import { CurrenciesArgs } from './dto/args/currencies.args';
import { CurrencyArgs } from './dto/args/currency.args';
import { CurrencyModel } from './models/currency.model';

@Resolver(() => CurrencyModel)
export class CurrencyResolver {
  constructor(private readonly currencyService: CurrencyService) {}

  @Query(() => CurrencyModel)
  currency(@Args() args: CurrencyArgs): Promise<CurrencyModel> {
    return this.currencyService.getCurrencyById(args);
  }

  @Query(() => [CurrencyModel])
  currencies(@Args() args: CurrenciesArgs): Promise<CurrencyModel[]> {
    return this.currencyService.getAllCurrencies(args);
  }
}
