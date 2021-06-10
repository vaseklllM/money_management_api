import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { CurrencyModel } from 'src/currency/models/currency.model';
import { Pagination } from 'src/modes/app.modes';
import { CurrencyAccountHistoryModel } from '../../currency-accounts-history/models/currency-account-history.model';

@ObjectType()
export class CurrencyAccountModel {
  @Field(() => ID)
  id: string;

  @Field(() => CurrencyModel)
  currency: CurrencyModel;

  @Field(() => String)
  name: string;

  @Field(() => Float)
  value: number;

  @Field(() => [CurrencyAccountHistoryModel])
  history: CurrencyAccountHistoryModel[];

  @Field(() => Pagination)
  historyPagination: Pagination;
}
