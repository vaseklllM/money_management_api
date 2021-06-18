import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guard';
import TokenUserModel from 'src/auth/models/token-user.model';
import { CurrentUser } from 'src/utils';
import { CurrencyAccountsService } from './currency-accounts.service';
import { CurrencyAccountArgs } from './dto/args/currency-account.args';
import { CurrencyAccountsArgs } from './dto/args/currency-accounts.args';
import { AddTransactionCurrencyAccountInput } from './dto/inputs/add-transaction-currency-account.input';
import { CreateCurrencyAccountInput } from './dto/inputs/create-currency-account.input';
import { DeleteCurrencyAccountInput } from './dto/inputs/delete-currency-account.input';
import { DeleteTransactionCurrencyAccountInput } from './dto/inputs/delete-transaction-currency-account.input';
import { UpdateCurrencyAccountInput } from './dto/inputs/update-currency-account.input';
import { CurrencyAccountModel } from './models/currency-account.model';

/** Валютні рахунки */
@Resolver(() => [CurrencyAccountModel])
export class CurrencyAccountsResolver {
  constructor(private readonly service: CurrencyAccountsService) {}

  @Query(() => CurrencyAccountModel, { name: 'currencyAccount' })
  @UseGuards(GqlAuthGuard)
  currencyAccount(
    @Args() args: CurrencyAccountArgs,
    @CurrentUser() tokenUser: TokenUserModel,
  ): Promise<CurrencyAccountModel> {
    return this.service.currencyAccount(tokenUser, args);
  }

  @Query(() => [CurrencyAccountModel], { name: 'currencyAccounts' })
  @UseGuards(GqlAuthGuard)
  currencyAccounts(
    @Context() context,
    @Args() args: CurrencyAccountsArgs,
    @CurrentUser() tokenUser: TokenUserModel,
  ): Promise<CurrencyAccountModel[]> {
    // console.log(context.res.cookies);
    return this.service.currencyAccounts(tokenUser, args);
  }

  @Mutation(() => CurrencyAccountModel)
  @UseGuards(GqlAuthGuard)
  createCurrencyAccount(
    @Args('createCurrencyAccount') input: CreateCurrencyAccountInput,
    @CurrentUser() tokenUser: TokenUserModel,
  ): Promise<CurrencyAccountModel> {
    return this.service.createCurrencyAccount(tokenUser, input);
  }

  @Mutation(() => CurrencyAccountModel)
  @UseGuards(GqlAuthGuard)
  updateCurrencyAccount(
    @Args('updateCurrencyAccount') input: UpdateCurrencyAccountInput,
  ): Promise<CurrencyAccountModel> {
    return this.service.updateCurrencyAccount(input);
  }

  @Mutation(() => [CurrencyAccountModel])
  @UseGuards(GqlAuthGuard)
  deleteCurrencyAccount(
    @Args('deleteCurrencyAccount') input: DeleteCurrencyAccountInput,
    @CurrentUser() tokenUser: TokenUserModel,
  ): Promise<CurrencyAccountModel[]> {
    return this.service.deleteCurrencyAccount(tokenUser, input);
  }

  @Mutation(() => CurrencyAccountModel)
  @UseGuards(GqlAuthGuard)
  addTransactionCurrencyAccount(
    @Args('addTransactionCurrencyAccount')
    input: AddTransactionCurrencyAccountInput,
  ): Promise<CurrencyAccountModel> {
    return this.service.addTransactionCurrencyAccount(input);
  }

  @Mutation(() => CurrencyAccountModel)
  @UseGuards(GqlAuthGuard)
  deleteTransactionCurrencyAccount(
    @Args('deleteTransactionCurrencyAccount')
    input: DeleteTransactionCurrencyAccountInput,
    @CurrentUser() tokenUser: TokenUserModel,
  ): Promise<CurrencyAccountModel> {
    return this.service.deleteTransactionCurrencyAccount(input, tokenUser);
  }
}
