import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TokenUserModel from 'src/auth/models/token-user.model';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import {
  Currency,
  CurrencyDocument,
} from 'src/currency/schemas/currency.schema';
import { mongo } from 'src/utils';
import { ChangeBankInputDto } from './dto/inputs/change-bank.input.dto';
import { DeleteBankCardInput } from './dto/inputs/delete-bank-card.input.dto';
import BankCardsModel from './models/bank-cards.model';
import { BankCard, BankCardDocument } from './schema/bank-card.schema';
import { BankCardInput } from './dto/inputs/change-bank.input.dto';
import { BankCardHistoryModel } from './models/bank-cards.model/bank-card-history.model';
import {
  BankCardHistory,
  BankCardHistoryDocument,
} from './schema/bank-card-history.schema';
import fetch from 'node-fetch';
import { CurrencyModel } from 'src/currency/models/currency.model';
import { CurrencyService } from 'src/currency/currency.service';

const dataUpdateTimeHours = 6;

interface IMonobankServerData {
  clientId: string;
  name: string;
  webHookUrl: string;
  permissions: string;
  accounts: {
    id: string;
    currencyCode: number;
    cashbackType: string;
    balance: number;
    creditLimit: number;
    type: string;
    iban: string;
    maskedPan: string[];
  }[];
}

@Injectable()
export class BankCardsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BankCard.name) private bankCardModel: Model<BankCardDocument>,
    @InjectModel(BankCardHistory.name)
    private bankCardHistoryModel: Model<BankCardHistoryDocument>,
    @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
    @Inject(forwardRef(() => CurrencyService))
    private currencyService: CurrencyService,
  ) {}

  private async changeIsValidToken(
    bank: keyof BankCardsModel = 'monobank',
    userId: string,
    value: boolean,
  ) {
    const isValid = (
      await this.userModel.aggregate([
        {
          $match: { _id: mongo.ObjectId(userId) },
        },
        {
          $project: {
            _id: 0,
            isValid: '$bankCards.monobank.isValidToken',
          },
        },
      ])
    )[0].isValid;

    if (isValid === value) return undefined;

    const userUpdate = await this.userModel.updateOne(
      {
        _id: mongo.ObjectId(userId),
      },
      {
        [`bankCards.${bank}.isValidToken`]: value,
      },
    );

    console.log(userUpdate);

    if (!userUpdate) {
      throw new Error(
        `Помилка при спробі змінити: bankCards.${bank}.isValidToken на значення: ${value}`,
      );
    }
  }

  async getNewMonobankCardsHistory(
    userId: string,
  ): Promise<IMonobankServerData> {
    const token = (
      await this.userModel.aggregate<{ token: string }>([
        {
          $match: { _id: mongo.ObjectId(userId) },
        },
        {
          $project: {
            _id: 0,
            token: `$bankCards.monobank.token`,
          },
        },
      ])
    )[0].token;

    const res = await fetch('https://api.monobank.ua/personal/client-info', {
      method: 'GET',
      headers: {
        'X-Token': token,
      },
    });

    if (!res.ok) {
      // throw new Error('Помилка при оновленні даних карти монобанку');
      await this.changeIsValidToken('monobank', userId, false);
      return null;
    }

    await this.changeIsValidToken('monobank', userId, true);

    const dataText = await res.text();
    const data = JSON.parse(dataText);

    return data;
  }

  /** Оновлення історії карти монобанку */
  private async updateMonobankHistory(userId: string) {
    const data = await this.getNewMonobankCardsHistory(userId);

    if (!data) return undefined;

    const currencies = await this.currencyModel.find();

    const historyId = await this.createBankCardsHistoryItem(
      data.accounts.map((el) => ({
        balance: el.balance / 100,
        currencyCode: currencies.find((i) => i.ISOCode === el.currencyCode)
          .code,
        iban: el.iban,
        cardNumber: el.maskedPan[0],
      })),
    );

    const userUpdate = await this.userModel.updateOne(
      { _id: userId },
      {
        $push: {
          'bankCards.monobank.historyCards': {
            $each: [historyId],
            $position: 0,
          },
        },
      },
    );

    if (!userUpdate || !userUpdate) {
      throw new Error('Помилка при збереженні');
    }
  }

  /** автоматичне оновлення даних банківських карт */
  private async checkUpdateHistoryCard(
    userId: string,
    bank: keyof BankCardsModel,
  ) {
    interface ILastElDate {
      date: Date;
    }

    const lastElDate = (
      await this.userModel.aggregate<ILastElDate>([
        {
          $match: { _id: mongo.ObjectId(userId) },
        },
        {
          $project: {
            _id: 0,
            cardId: `$bankCards.${bank}.historyCards`,
          },
        },
        {
          $unwind: '$cardId',
        },
        {
          $lookup: {
            from: 'bankcardhistories',
            localField: 'cardId',
            foreignField: '_id',
            as: 'card',
          },
        },
        {
          $unwind: '$card',
        },
        {
          $project: {
            _id: '$card._id',
            cards: '$card.cards',
            date: '$card.date',
          },
        },
        { $sort: { date: -1 } },
        { $limit: 1 },
        {
          $project: {
            _id: 0,
            date: 1,
          },
        },
      ])
    )[0];

    if (typeof lastElDate.date === 'object') {
      const diff = new Date().getTime() - lastElDate.date.getTime();
      const hours = diff / 1000 / 60 / 60;

      /** якщо пройшло більше 12 годин від
       * останнього оновлення даних банківської карти */
      if (hours > dataUpdateTimeHours) {
        switch (bank) {
          case 'monobank':
            await this.updateMonobankHistory(userId);
            break;

          default:
            break;
        }
      }
    }
  }

  private async getHistoryCards(
    userId: string,
    bank: keyof BankCardsModel = 'monobank',
  ): Promise<BankCardHistoryModel[]> {
    const user = await this.userModel.findById(userId);

    await this.checkUpdateHistoryCard(userId, bank);

    if (
      !Array.isArray(user?.bankCards?.[bank]?.historyCards) ||
      user.bankCards[bank].historyCards.length === 0
    ) {
      /** Якщо немає historyCards */
      return [];
    }

    interface ICard {
      _id: string;
      iban: string;
      cardNumber: string;
      balance: number;
      currencyId: string;
    }

    interface IHistoryCards {
      _id: string;
      cards: ICard[];
      date: Date;
      currencies: {
        _id: string;
        ISOCode: number;
        code: string;
        symbol: string;
      }[];
    }

    const historyCards = await this.userModel.aggregate<IHistoryCards>([
      {
        $match: { _id: mongo.ObjectId(userId) },
      },
      {
        $project: {
          _id: 0,
          cardId: `$bankCards.${bank}.historyCards`,
        },
      },
      {
        $unwind: '$cardId',
      },
      {
        $lookup: {
          from: 'bankcardhistories',
          localField: 'cardId',
          foreignField: '_id',
          as: 'card',
        },
      },
      {
        $project: {
          card: 1,
        },
      },
      {
        $unwind: '$card',
      },
      {
        $project: {
          _id: '$card._id',
          cards: '$card.cards',
          date: '$card.date',
        },
      },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'bankcards',
          localField: 'cards',
          foreignField: '_id',
          as: 'cards',
        },
      },
      {
        $lookup: {
          from: 'currencies',
          localField: 'cards.currencyId',
          foreignField: '_id',
          as: 'currencies',
        },
      },
    ]);

    const currencies: CurrencyModel[] =
      await this.currencyService.getAllCurrencies({ numberOfHistoryItems: 1 });

    return historyCards.map((historyCard) => ({
      date: historyCard.date,
      cards: historyCard.cards.map((card) => ({
        id: card._id,
        iban: card.iban,
        cardNumber: card.cardNumber,
        balance: card.balance,
        currency: currencies.find(
          (i) => String(i.id) === String(card.currencyId),
        ),
      })),
      id: historyCard._id,
    }));
  }

  private async getBanks(tokenUser: TokenUserModel): Promise<BankCardsModel> {
    const user = await this.userModel.findById(tokenUser.userId);

    return {
      monobank: user.bankCards?.monobank
        ? {
            historyCards: await this.getHistoryCards(tokenUser.userId),
            token: user.bankCards.monobank.token,
            user: {
              firstName: user.bankCards.monobank.user.firstName,
              lastName: user.bankCards.monobank.user.lastName,
            },
            isValidToken: user.bankCards.monobank.isValidToken,
          }
        : null,
    };
  }

  /** видалення історії банківських карт */
  private async deleteBankCardsHistoryItems(ids: string[]) {
    if (ids.length <= 0) return undefined;

    const cardHistories = await this.bankCardHistoryModel.find({
      $or: ids.map((i) => ({ _id: mongo.ObjectId(i) })),
    });

    let cardIds = [];

    cardHistories.forEach((el) => {
      cardIds = [...cardIds, ...el.cards];
    });

    if (cardIds.length !== 0) {
      const deleteCardsRes = await this.bankCardModel.remove({
        $or: cardIds.map((i) => ({ _id: i })),
      });

      // console.log(deleteCardsRes);

      if (!deleteCardsRes.ok) {
        throw new Error('Помилка при видаленні');
      }
    }

    const deleteHistoriesRes = await this.bankCardHistoryModel.remove({
      $or: ids.map((i) => ({ _id: i })),
    });

    if (!deleteHistoriesRes.ok) {
      throw new Error('Помилка при видаленні');
    }
  }

  /** створення нової історії банківських карт */
  private async createBankCardsHistoryItem(
    cards: BankCardInput[],
  ): Promise<string> {
    const arrCarsId = [];

    for await (const card of cards) {
      const currency = await this.currencyModel.findOne(
        {
          code: card.currencyCode,
        },
        { _id: 1 },
      );

      const newCard = await new this.bankCardModel({
        iban: card.iban,
        cardNumber: card.cardNumber,
        balance: card.balance,
        currencyId: currency._id,
      }).save();

      arrCarsId.push(newCard._id);
    }

    const bankCardsHistoryItem = await new this.bankCardHistoryModel({
      cards: arrCarsId,
      date: new Date(),
    }).save();

    return bankCardsHistoryItem._id;
  }

  /** оновлення параметрів банка */
  private async addBank(
    input: ChangeBankInputDto,
    tokenUser: TokenUserModel,
    bankKey: keyof BankCardsModel,
  ): Promise<BankCardsModel> {
    const user = await this.userModel.findById(tokenUser.userId);

    const activeCars = user?.bankCards?.[bankKey]?.historyCards;

    if (Array.isArray(activeCars) && activeCars.length !== 0) {
      await this.deleteBankCardsHistoryItems(
        user.bankCards[bankKey].historyCards.map((i) => String(i)),
      );
    }

    const historyItem = await this.createBankCardsHistoryItem(input.cards);

    const userUpdate = await user.update({
      [`bankCards.${bankKey}`]: {
        token: input.token,
        user: {
          firstName: input.userFirstName,
          lastName: input.userLastName,
        },
        historyCards: [historyItem],
        isValidToken: true,
      },
    });

    if (!userUpdate.ok || !userUpdate.nModified) {
      throw new Error('Помилка при збереженні');
    }

    return this.getBanks(tokenUser);
  }

  async getBankCards(tokenUser: TokenUserModel): Promise<BankCardsModel> {
    return this.getBanks(tokenUser);
  }

  async changeMonobank(
    input: ChangeBankInputDto,
    user: TokenUserModel,
  ): Promise<BankCardsModel> {
    return this.addBank(input, user, 'monobank');
  }

  /** Видалення банківських карт */
  async deleteBankCards(
    input: DeleteBankCardInput,
    tokenUser: TokenUserModel,
  ): Promise<BankCardsModel> {
    const user = await this.userModel.findOne({ _id: tokenUser.userId });

    const newBankCards = { ...user.bankCards };

    for await (const key of input.keys) {
      if (user?.bankCards[key]) {
        await this.deleteBankCardsHistoryItems(
          user.bankCards[key].historyCards.map((i) => String(i)),
        );
        delete newBankCards[key];
      }
    }

    const updateRes = await user.update({
      bankCards: newBankCards,
    });

    if (!updateRes.ok) throw new Error('Помилка при Видаленні');

    return this.getBanks(tokenUser);
  }
}
