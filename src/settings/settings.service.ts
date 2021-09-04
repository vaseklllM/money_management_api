import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TokenUserModel from 'src/auth/models/token-user.model';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { UpdateSettingsInput } from './dto/inputs/update-settings.input';
import { SettingsModel } from './models/settings.model';
// import { Settings, SettingsDocument } from './schema/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    // @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getSettings(userToken: TokenUserModel): Promise<SettingsModel> {
    const user = await this.userModel.findById(userToken.userId, {
      settings: 1,
    });

    return {
      id: user._id,
      sideMenu: {
        open: user.settings?.sideMenu?.open || false,
      },
    };
  }

  async updateSettings(
    userToken: TokenUserModel,
    input: UpdateSettingsInput,
  ): Promise<SettingsModel> {
    const user = await this.userModel.findById(userToken.userId);

    const userObj = user.toObject();

    const updateStatus = await user.updateOne({
      settings: {
        ...userObj.settings,
        sideMenu: {
          ...userObj.settings?.sideMenu,
          ...input.sideMenu,
        },
      },
    });

    if (!updateStatus.acknowledged) {
      throw new Error('помилка при збереженні');
    }

    return this.getSettings(userToken);
  }
}
