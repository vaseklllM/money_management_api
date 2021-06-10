import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/jwt-auth.guard';
import TokenUserModel from 'src/auth/models/token-user.model';
import { CurrentUser } from 'src/utils';
import { UpdateSettingsInput } from './dto/inputs/update-settings.input';
import { SettingsModel } from './models/settings.model';
import { SettingsService } from './settings.service';

@Resolver(() => SettingsModel)
export class SettingsResolver {
  constructor(private readonly service: SettingsService) {}

  @Query(() => SettingsModel, { name: 'settings' })
  @UseGuards(GqlAuthGuard)
  settings(@CurrentUser() user: TokenUserModel): Promise<SettingsModel> {
    return this.service.getSettings(user);
  }

  @Mutation(() => SettingsModel)
  @UseGuards(GqlAuthGuard)
  updateSettings(
    @Args('updateSettings') input: UpdateSettingsInput,
    @CurrentUser() user: TokenUserModel,
  ): Promise<SettingsModel> {
    return this.service.updateSettings(user, input);
  }
}
