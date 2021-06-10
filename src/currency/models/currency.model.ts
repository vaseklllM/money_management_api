import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { CurrencyHistoryModel } from './currency-history.model';

@ObjectType()
export class CurrencyModel {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  ISOCode: number;

  @Field(() => String)
  code: string;

  @Field(() => String)
  symbol: string;

  @Field(() => [CurrencyHistoryModel])
  historyCourseInUAH: CurrencyHistoryModel[];
}
