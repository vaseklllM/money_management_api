import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BankCardHistoryModel } from './bank-card-history.model';

@ObjectType()
class BankUserModel {
  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;
}

@ObjectType()
export default class BankModel {
  @Field(() => ID)
  token: string;

  @Field(() => BankUserModel)
  user: BankUserModel;

  @Field(() => [BankCardHistoryModel])
  historyCards: BankCardHistoryModel[];
}
