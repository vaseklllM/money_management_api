import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
class SettingsSideMenuModel {
  @Field(() => Boolean)
  open: boolean;
}

@ObjectType()
export class SettingsModel {
  @Field(() => ID)
  id: string;

  @Field(() => SettingsSideMenuModel)
  sideMenu: SettingsSideMenuModel;
}
