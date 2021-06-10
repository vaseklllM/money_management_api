import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignInInput } from './dto/input/sign-in.input.dto';
import { SignUpInput } from './dto/input/sign-up.input.dto';
import { UserModel } from './models/user.model';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import TokenUserModel from './models/token-user.model';
import { AuthUserModel } from './models/auth-user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /** генерує токен */
  private getToken(user: UserDocument) {
    return this.jwtService.sign({
      username: user.email,
      sub: user._id,
    });
  }

  /** генерує дані користувача */
  private convertUserData(user: UserDocument): AuthUserModel {
    return {
      id: user._id,
      email: user.email,
      token: this.getToken(user),
      nickname: user.nickname,
    };
  }

  /** вхід в аккаунт */
  async singIn(singInInput: SignInInput): Promise<AuthUserModel> {
    const user = await this.userModel.findOne({ email: singInInput.email });

    const errorText = 'Невірний логін або пароль';

    if (!user) throw new Error(errorText);

    const isPassword = await bcrypt.compare(
      singInInput.password,
      user.password,
    );

    if (!isPassword) throw new Error(errorText);

    return this.convertUserData(user);
  }

  /** реєстрація */
  async signUp(signUpInput: SignUpInput): Promise<AuthUserModel> {
    try {
      const hashedPassword = await bcrypt.hash(signUpInput.password, 12);
      signUpInput.password = hashedPassword;
      const user = new this.userModel({
        ...signUpInput,
        registrationDate: new Date(),
      });
      await user.save();
      return this.convertUserData(user);
    } catch (error) {
      function checkRequired(key) {
        return (
          error.code === 11000 && Object.keys(error.keyValue).includes(key)
        );
      }

      if (checkRequired('nickname')) {
        throw new Error(
          `Користувач з нікнеймом "${error.keyValue.nickname}" вже зареєстрований`,
        );
      }

      if (checkRequired('email')) {
        throw new Error(
          `Користувач з email "${error.keyValue.email}" вже зареєстрований`,
        );
      }
    }
  }

  async getUser(tokenUser: TokenUserModel): Promise<UserModel> {
    const user = await this.userModel.findOne({ _id: tokenUser.userId });

    return {
      id: user._id,
      email: user.email,
      nickname: user.nickname,
      registrationDate: user.registrationDate,
    };
  }
}
