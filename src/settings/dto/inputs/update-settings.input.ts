import { Field, InputType } from '@nestjs/graphql';

@InputType()
class UpdateSettingsSideMenuInput {
  @Field(() => Boolean, { nullable: true })
  open: boolean;
}

@InputType()
export class UpdateSettingsInput {
  @Field(() => UpdateSettingsSideMenuInput, { nullable: true })
  sideMenu?: UpdateSettingsSideMenuInput;
}
