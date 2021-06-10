import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CurrencyAccountHistoryModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  currencyAccountValue: number;
}
