import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CurrencyArgs {
  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number;
}
