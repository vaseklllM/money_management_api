import { Field, Float, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddTransactionCurrencyAccountInput {
  @Field(() => ID)
  currencyAccountId: string;

  @Field(() => Float)
  value: number;

  @Field(() => String)
  title: string;

  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number;

  @Field(() => Int, { nullable: true })
  historyPage?: number;
}
