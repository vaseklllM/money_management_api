import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Pagination {
  /** активна сторінка пагінації */
  @Field(() => Int)
  page: number;

  /** загальна кількість елементів */
  @Field(() => Int)
  amountOfElements: number;

  /** кількість елементів на сторінці */
  @Field(() => Int)
  amountOfElementsByPage: number;

  /** кількість сторінок */
  @Field(() => Int)
  numberOfPages: number;
}
