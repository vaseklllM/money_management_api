import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

/** Реєстрація */
@InputType()
export class SignUpInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Неправильно введений email' })
  @IsNotEmpty()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  nickname: string;

  @Field(() => String)
  @IsNotEmpty()
  @MinLength(5, { message: 'Пароль повинен бути розміром більше 5 символів' })
  @MaxLength(20, { message: 'Пароль повинен бути розміром менше 20 символів' })
  password: string;
}
