import { ArgsType, Field, ID, Int } from '@nestjs/graphql';

@ArgsType()
export class CurrencyArgs {
  @Field(() => ID)
  id: string;

  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number = 1;
}
