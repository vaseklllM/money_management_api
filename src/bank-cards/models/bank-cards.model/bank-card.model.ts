import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { CurrencyModel } from 'src/currency/models/currency.model';

@ObjectType()
export class BankCardModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  iban: string;

  @Field(() => String, { nullable: true })
  cardNumber?: string;

  @Field(() => Float)
  balance: number;

  @Field(() => CurrencyModel)
  currency: CurrencyModel;
}
