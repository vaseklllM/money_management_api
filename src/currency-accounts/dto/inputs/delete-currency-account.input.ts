import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteCurrencyAccountInput {
  @Field(() => ID)
  id: string;
}
