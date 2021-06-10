import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BankCardModel } from './bank-card.model';

@ObjectType()
export class BankCardHistoryModel {
  @Field(() => ID)
  id: string;

  @Field(() => [BankCardModel])
  cards: BankCardModel[];

  @Field(() => Date)
  date: Date;
}
