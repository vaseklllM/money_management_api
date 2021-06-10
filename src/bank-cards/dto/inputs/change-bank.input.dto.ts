import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BankCardInput {
  @Field(() => String)
  iban: string;

  @Field(() => Number)
  balance: number;

  @Field(() => String, { nullable: true })
  cardNumber?: string;

  @Field(() => String)
  currencyCode: string;
}

@InputType()
export class ChangeBankInputDto {
  @Field(() => String)
  token: string;

  @Field(() => String)
  userFirstName: string;

  @Field(() => String)
  userLastName: string;

  @Field(() => [BankCardInput])
  cards: [BankCardInput];
}
