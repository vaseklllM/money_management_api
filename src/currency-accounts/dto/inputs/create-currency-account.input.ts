import { Field, Float, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCurrencyAccountInput {
  @Field(() => ID)
  currencyId: string;

  @Field(() => Float)
  value: number;

  @Field(() => String)
  name: string;
}
