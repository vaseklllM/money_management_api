import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
// import { Settings, SettingsSchema } from './schema/settings.schema';
import { SettingsResolver } from './settings.resolver';
import { SettingsService } from './settings.service';

@Module({
  providers: [SettingsResolver, SettingsService],
  imports: [
    MongooseModule.forFeature([
      // { name: Settings.name, schema: SettingsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
export class SettingsModule {}
