import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SettingsDocument = Settings & mongoose.Document;

@Schema()
class SettingsSideMenu {
  @Prop({ required: true })
  open: boolean;
}

@Schema()
export class Settings {
  @Prop({
    type: SettingsSideMenu,
    required: true,
  })
  sideMenu: SettingsSideMenu;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
