import { Field, ObjectType } from '@nestjs/graphql';
import BankModel from './bank.model';

@ObjectType()
export default class BankCardsModel {
  @Field(() => BankModel, { nullable: true })
  monobank?: BankModel;
}
