import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateCurrencyAccountInput {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ID)
  currencyId: string;
}
