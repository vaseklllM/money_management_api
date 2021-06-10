import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CurrencyAccountsArgs {
  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number;

  @Field(() => Int, { nullable: true })
  historyPage?: number;
}
