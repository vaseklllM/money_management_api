import { ArgsType, Field, ID, Int } from '@nestjs/graphql';

@ArgsType()
export class CurrencyAccountArgs {
  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number;

  @Field(() => Int, { nullable: true })
  historyPage?: number;

  @Field(() => ID)
  currencyAccountId: string;
}
