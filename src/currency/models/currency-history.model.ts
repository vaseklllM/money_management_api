import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CurrencyHistoryModel {
  @Field(() => ID)
  id: string;

  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  price: number;
}
