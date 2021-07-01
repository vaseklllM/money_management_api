import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CurrenciesArgs {
  @Field(() => Int, { nullable: true })
  numberOfHistoryItems?: number;
}
