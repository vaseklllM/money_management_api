import { Field, InputType } from '@nestjs/graphql';
import BankCardsModel from 'src/bank-cards/models/bank-cards.model';

@InputType()
export class DeleteBankCardInput {
  @Field(() => [String])
  keys: (keyof BankCardsModel)[];
}
