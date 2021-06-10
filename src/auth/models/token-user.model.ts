import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export default class TokenUserModel {
  @Field(() => ID)
  userId: string;

  @Field(() => String)
  username: string;
}
