import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

/** Вхід в аккаунт */
@InputType()
export class SignInInput {
  @Field()
  @IsEmail({}, { message: 'Неправильно введений email' })
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(5, { message: 'Пароль повинен бути розміром більше 5 символів' })
  @MaxLength(20, { message: 'Пароль повинен бути розміром менше 20 символів' })
  password: string;
}
