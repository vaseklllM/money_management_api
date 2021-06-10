import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@ArgsType()
export default class UserArgs {
  // @Field(() => ID)
  // @IsNotEmpty()
  // id: string;

  // @Field(() => String)
  // @IsNotEmpty()
  // @IsEmail()
  // email: string;

  // @Field(() => String)
  // @IsNotEmpty()
  // nickname: string;
}
