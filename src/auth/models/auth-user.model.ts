import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthUserModel {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  token: string;

  @Field(() => String)
  nickname: string;
}
