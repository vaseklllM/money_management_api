import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guard';
import TokenUserModel from 'src/auth/models/token-user.model';
import { CurrentUser } from 'src/utils';
import { BankCardsService } from './bank-cards.service';
import BankCardsModel from './models/bank-cards.model';
import { ChangeBankInputDto } from './dto/inputs/change-bank.input.dto';
// import BankModel from './models/bank-cards.model/bank.model';
import { DeleteBankCardInput } from './dto/inputs/delete-bank-card.input.dto';

@Resolver(() => BankCardsModel)
export class BankCardsResolver {
  constructor(private readonly backCardsService: BankCardsService) {}

  /** всі банки */
  @Query(() => BankCardsModel, { name: 'bankcards' })
  @UseGuards(GqlAuthGuard)
  bankcards(@CurrentUser() user: TokenUserModel): Promise<BankCardsModel> {
    return this.backCardsService.getBankCards(user);
  }

  /** оновлення монобанка */
  @Mutation(() => BankCardsModel)
  @UseGuards(GqlAuthGuard)
  addMonobank(
    @Args('addMonobank') input: ChangeBankInputDto,
    @CurrentUser() user: TokenUserModel,
  ): Promise<BankCardsModel> {
    return this.backCardsService.changeMonobank(input, user);
  }

  // /** оновлення приватбанка */
  // @Mutation(() => BankCardModel)
  // @UseGuards(GqlAuthGuard)
  // changePrivatbank(
  //   @Args('changePrivatbank') input: ChangeBankInputDto,
  //   @CurrentUser() user: TokenUserModel,
  // ): Promise<BankCardModel> {
  //   return this.backCardsService.changePrivatbank(input, user);
  // }

  // /** оновлення ощадбанка */
  // @Mutation(() => BankCardModel)
  // @UseGuards(GqlAuthGuard)
  // changeOshadbank(
  //   @Args('changeOshadbank') input: ChangeBankInputDto,
  //   @CurrentUser() user: TokenUserModel,
  // ): Promise<BankCardModel> {
  //   return this.backCardsService.changeOshadbank(input, user);
  // }

  @Mutation(() => BankCardsModel)
  @UseGuards(GqlAuthGuard)
  deleteBankCards(
    @Args('deleteBankCards') input: DeleteBankCardInput,
    @CurrentUser() user: TokenUserModel,
  ): Promise<BankCardsModel> {
    return this.backCardsService.deleteBankCards(input, user);
  }
}
