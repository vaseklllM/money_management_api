import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class DeleteTransactionCurrencyAccountInput {
  @Field(() => ID)
  currencyAccountHistoryId: string;

  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number;

  @Field(() => Int, { nullable: true })
  historyPage?: number;
}
