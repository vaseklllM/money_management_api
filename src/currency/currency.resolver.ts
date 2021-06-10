import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrencyService } from './currency.service';
import { CurrencyArgs } from './dto/args/currency.args';
import { CurrencyModel } from './models/currency.model';

@Resolver()
export class CurrencyResolver {
  constructor(private readonly currencyService: CurrencyService) {}

  @Query(() => [CurrencyModel])
  currencies(@Args() args: CurrencyArgs): Promise<CurrencyModel[]> {
    return this.currencyService.currencies(args);
  }
}
