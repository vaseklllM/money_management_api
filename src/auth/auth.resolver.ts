import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/utils';
import { AuthService } from './auth.service';
import { SignInInput } from './dto/input/sign-in.input.dto';
import { SignUpInput } from './dto/input/sign-up.input.dto';
import { GqlAuthGuard } from './jwt-auth.guard';
import { AuthUserModel } from './models/auth-user.model';
import TokenUserModel from './models/token-user.model';
import { UserModel } from './models/user.model';

@Resolver(() => UserModel)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /** Інформація про користувача */
  @Query(() => UserModel, { name: 'user' })
  @UseGuards(GqlAuthGuard)
  user(@CurrentUser() user: TokenUserModel): Promise<UserModel> {
    return this.authService.getUser(user);
  }

  /** Вхід в аккаунт */
  @Mutation(() => AuthUserModel)
  signIn(@Args('signIn') singInInput: SignInInput): Promise<AuthUserModel> {
    return this.authService.singIn(singInInput);
  }

  /** Реєстрація */
  @Mutation(() => AuthUserModel)
  signUp(@Args('signUp') signUpInput: SignUpInput): Promise<AuthUserModel> {
    return this.authService.signUp(signUpInput);
  }
}
