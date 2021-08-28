import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TokenUserModel from 'src/auth/models/token-user.model';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { CreateCurrencyAccountInput } from './dto/inputs/create-currency-account.input';
import { DeleteCurrencyAccountInput } from './dto/inputs/delete-currency-account.input';
import { CurrencyAccountModel } from './models/currency-account.model';
import { UpdateCurrencyAccountInput } from './dto/inputs/update-currency-account.input';
import { CurrencyAccountsArgs } from './dto/args/currency-accounts.args';
import { mongo } from 'src/utils';
import {
  CurrencyAccount,
  CurrencyAccountDocument,
} from './schemas/currency-account.schema';
import {
  CurrencyAccountHistory,
  CurrencyAccountHistoryDocument,
} from 'src/currency-accounts-history/schemas/currency-account-history.schema';
import { AddTransactionCurrencyAccountInput } from './dto/inputs/add-transaction-currency-account.input';
import { CurrencyAccountHistoryModel } from 'src/currency-accounts-history/models/currency-account-history.model';
import { Pagination } from 'src/modes/app.modes';
import { CurrencyAccountArgs } from './dto/args/currency-account.args';
import { DeleteTransactionCurrencyAccountInput } from './dto/inputs/delete-transaction-currency-account.input';

@Injectable()
export class CurrencyAccountsService {
  constructor(
    @InjectModel(CurrencyAccount.name)
    private currencyAccountModel: Model<CurrencyAccountDocument>,
    @InjectModel(CurrencyAccountHistory.name)
    private currencyAccountHistoryModel: Model<CurrencyAccountHistoryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /** оновлення значень currencyAccountValue елементів які йдуть після елемента historyId  */
  private async updateHistoryIdItems(historyId: string): Promise<boolean> {
    interface IHistoryIds {
      _id: string;
    }

    const historyIds = await this.currencyAccountModel.aggregate<IHistoryIds>([
      {
        $match: { historyId: mongo.ObjectId(historyId) },
      },
      {
        $lookup: {
          from: 'currencyaccounthistories',
          localField: 'historyId',
          foreignField: '_id',
          as: 'history',
        },
      },
      {
        $project: {
          _id: 0,
          history: 1,
        },
      },
      {
        $unwind: '$history',
      },
      { $sort: { 'history.date': -1 } },
      {
        $project: {
          _id: '$history._id',
        },
      },
    ]);

    const getActiveElements = (ids: IHistoryIds[]): string[] => {
      const arr: string[] = [];

      for (let i = 0; i < ids.length; i++) {
        const el = ids[i];
        if (String(el._id) === historyId) {
          if (ids[i + 1]) {
            arr.push(String(ids[i + 1]._id));
          } else arr.push(null);
          break;
        }
        arr.push(String(el._id));
      }

      return arr;
    };

    const activeElements = getActiveElements(historyIds).reverse();

    if (activeElements.length === 0) return true;

    /** оновлення значення currencyAccountValue в історії операцій з рахунком по historyId */
    const updateHistoryItem = async (
      activeHistoryId,
      prevHistoryId,
    ): Promise<boolean> => {
      /** якщо користувач видаляє любий крім першого елемента */
      if (prevHistoryId) {
        const historyItem = await this.currencyAccountHistoryModel.findById(
          activeHistoryId,
        );

        const prevHistoryItem = await this.currencyAccountHistoryModel.findById(
          prevHistoryId,
        );

        await historyItem.update({
          $set: {
            currencyAccountValue:
              prevHistoryItem.currencyAccountValue + historyItem.value,
          },
        });

        return true;
      }
      /** якщо видалено перший елемент */
      const historyItem = await this.currencyAccountHistoryModel.findById(
        activeHistoryId,
      );

      const deletedHistoryItem =
        await this.currencyAccountHistoryModel.findById(historyId);

      await historyItem.update({
        $set: {
          currencyAccountValue:
            deletedHistoryItem.currencyAccountValue +
            historyItem.value -
            deletedHistoryItem.value,
        },
      });

      return false;
    };

    for await (const el of activeElements) {
      const idx = activeElements.indexOf(el);
      if (idx > 0) {
        await updateHistoryItem(el, activeElements[idx - 1]);
      }
    }

    return true;
  }

  /** повертає історію рахунка */
  private async getCurrencyAccountHistory(
    currencyAccountId: string,
    args: CurrencyAccountsArgs = {},
  ): Promise<{
    history: CurrencyAccountHistoryModel[];
    pagination: Pagination;
  }> {
    const { historyPage = 1 } = args;

    const numberOfHistoryItems = args.numberOfHistoryItems || 10;

    interface ITestData {
      elements: {
        history: {
          _id: string;
          title: string;
          date: Date;
          value: number;
          currencyAccountValue: number;
        };
      }[];
      pageInfo: {
        _id?: string;
        count: number;
      }[];
    }

    const currencyAccountHistory = (
      await this.currencyAccountModel.aggregate<ITestData>([
        {
          $match: { _id: mongo.ObjectId(currencyAccountId) },
        },
        {
          $lookup: {
            from: 'currencyaccounthistories',
            localField: 'historyId',
            foreignField: '_id',
            as: 'history',
          },
        },
        {
          $project: {
            _id: 0,
            history: 1,
          },
        },
        {
          $unwind: '$history',
        },
        {
          $facet: {
            elements: [
              { $sort: { 'history.date': -1 } },
              { $skip: numberOfHistoryItems * (historyPage - 1) },
              { $limit: numberOfHistoryItems },
            ],
            pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }],
          },
        },
      ])
    )[0];

    const amountOfElements = currencyAccountHistory.pageInfo[0].count;

    return {
      history: currencyAccountHistory.elements.map((el) => ({
        date: el.history.date,
        id: el.history._id,
        title: el.history.title,
        value: el.history.value,
        currencyAccountValue: el.history.currencyAccountValue,
      })),
      pagination: {
        page: historyPage,
        amountOfElements,
        numberOfPages: Math.ceil(amountOfElements / numberOfHistoryItems),
        amountOfElementsByPage: numberOfHistoryItems,
      },
    };
  }

  /** повертає рахунок */
  private async getCurrencyAccount(
    id: string,
    args?: CurrencyAccountsArgs,
  ): Promise<CurrencyAccountModel> {
    interface ICurrencyAccount {
      _id: string;
      name: string;
      value: number;
      currencyId: string;
    }

    const currencyAccount = (
      await this.currencyAccountModel.aggregate<ICurrencyAccount>([
        {
          $match: { _id: mongo.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'currencyaccounthistories',
            localField: 'historyId',
            foreignField: '_id',
            as: 'history',
          },
        },
        {
          $project: {
            historyId: 0,
          },
        },
      ])
    )[0];

    const currencyAccountHistory = await this.getCurrencyAccountHistory(
      id,
      args,
    );

    return {
      currency: {
        id: currencyAccount.currencyId,
        ISOCode: 0,
        code: '',
        historyCourseInUAH: [],
        symbol: '',
      },
      history: currencyAccountHistory.history,
      historyPagination: currencyAccountHistory.pagination,
      id: currencyAccount._id,
      name: currencyAccount.name,
      value: currencyAccount.value,
    };
  }

  async currencyAccount(
    tokenUser: TokenUserModel,
    args: CurrencyAccountArgs,
  ): Promise<CurrencyAccountModel> {
    const res = await this.userModel.findOne(
      { _id: tokenUser.userId },
      { currencyAccountsId: 1, _id: 0 },
    );

    if (
      !res.currencyAccountsId.find((i) => String(i) === args.currencyAccountId)
    ) {
      throw new Error(
        `В користувача немає рахунка з id "${args.currencyAccountId}"`,
      );
    }

    return this.getCurrencyAccount(args.currencyAccountId, args);
  }

  /** повертає список рахунків */
  async currencyAccounts(
    tokenUser: TokenUserModel,
    args: CurrencyAccountsArgs,
  ): Promise<CurrencyAccountModel[]> {
    const currencyAccountsIds = await this.userModel.findOne(
      {
        _id: tokenUser.userId,
      },
      { currencyAccountsId: 1, _id: 0 },
    );

    const currencyAccounts2: CurrencyAccountModel[] = [];

    for await (const el of currencyAccountsIds.currencyAccountsId) {
      const res = await this.getCurrencyAccount(String(el), args);
      currencyAccounts2.push(res);
    }

    return currencyAccounts2;
  }

  /** Створення нового рахунку */
  async createCurrencyAccount(
    tokenUser: TokenUserModel,
    input: CreateCurrencyAccountInput,
  ): Promise<CurrencyAccountModel> {
    const history = new this.currencyAccountHistoryModel({
      title: 'Створення рахунку',
      date: new Date(),
      value: input.value,
      currencyAccountValue: input.value,
    });

    await history.save();

    const currencyAccount = new this.currencyAccountModel({
      name: input.name,
      value: input.value,
      currencyId: input.currencyId,
      historyId: [history._id],
    });

    const user = await this.userModel.updateOne(
      { _id: mongo.ObjectId(tokenUser.userId) },
      {
        $push: { currencyAccountsId: currencyAccount._id },
      },
    );

    if (!user) {
      throw new Error(
        'Помилка при добавлені нового елемента в currencyAccountsId',
      );
    }

    const saveRes = await currencyAccount.save();

    return this.getCurrencyAccount(saveRes._id);
  }

  /** оновлення даних рахунка */
  async updateCurrencyAccount(
    input: UpdateCurrencyAccountInput,
  ): Promise<CurrencyAccountModel> {
    const updateRes = await this.currencyAccountModel.updateOne(
      {
        _id: mongo.ObjectId(input.id),
      },
      {
        $set: {
          name: input.name,
          currencyId: mongo.ObjectId(input.currencyId),
        },
      },
    );

    if (!updateRes) throw new Error('Помилка при збережені');

    return this.getCurrencyAccount(input.id);
  }

  async deleteCurrencyAccount(
    tokenUser: TokenUserModel,
    input: DeleteCurrencyAccountInput,
  ): Promise<CurrencyAccountModel[]> {
    const currencyAccount = await this.currencyAccountModel.findOne({
      _id: input.id,
    });

    /** видалення елементів з currencyaccounthistories */
    const removeHistoryRes = await this.currencyAccountHistoryModel.remove({
      $or: currencyAccount.historyId.map((i) => ({ _id: i })),
    });

    /** видалення елементів з currencyaccounts  */
    const removeFromCollectionRes = await this.currencyAccountModel.remove({
      _id: mongo.ObjectId(input.id),
    });

    /** Видалення id з user */
    const deleteFromUserRes = await this.userModel.updateOne(
      {
        _id: mongo.ObjectId(tokenUser.userId),
      },
      {
        $pull: {
          currencyAccountsId: mongo.ObjectId(input.id),
        },
      },
    );

    if (
      !deleteFromUserRes ||
      !removeFromCollectionRes.deletedCount ||
      !removeHistoryRes.deletedCount ||
      !deleteFromUserRes.acknowledged
    ) {
      throw new Error('Помилка при видаленні');
    }

    return this.currencyAccounts(tokenUser, { numberOfHistoryItems: 5 });
  }

  async addTransactionCurrencyAccount(
    input: AddTransactionCurrencyAccountInput,
  ): Promise<CurrencyAccountModel> {
    const currencyAccount = await this.currencyAccountModel.findOne({
      _id: input.currencyAccountId,
    });

    const newValue = input.value + currencyAccount.value;

    const history = new this.currencyAccountHistoryModel({
      title: input.title,
      date: new Date(),
      value: input.value,
      currencyAccountValue: newValue,
    });

    const updateCurruncyAccount = await currencyAccount.update({
      $push: {
        historyId: {
          $each: [history._id],
          $position: 0,
        },
      },
      $set: {
        value: newValue,
      },
    });

    if (!updateCurruncyAccount.acknowledged) {
      throw new Error('Помилка при створенні нового елемента');
    }

    await history.save();

    return this.getCurrencyAccount(input.currencyAccountId, {
      numberOfHistoryItems: input.numberOfHistoryItems,
      historyPage: input.historyPage,
    });
  }

  /** видалення історії з рахунку */
  async deleteTransactionCurrencyAccount(
    input: DeleteTransactionCurrencyAccountInput,
    tokenUser: TokenUserModel,
  ): Promise<CurrencyAccountModel> {
    const historyItem = await this.currencyAccountHistoryModel.findById(
      input.currencyAccountHistoryId,
    );

    const currencyAccount = await this.currencyAccountModel.findOne({
      historyId: mongo.ObjectId(input.currencyAccountHistoryId),
    });

    if (currencyAccount.historyId.length <= 1) {
      throw new Error('Останній елемент історії заборонено видаляти');
    }

    if (!currencyAccount || !historyItem) {
      throw new Error(
        `Не найдено рахунка з historyId: ${input.currencyAccountHistoryId}`,
      );
    }

    const user = await this.userModel.findById(tokenUser.userId);

    if (
      !user.currencyAccountsId.find((i) => String(i) === currencyAccount.id)
    ) {
      throw new Error(
        `id: ${input.currencyAccountHistoryId} не належить користувачу с email: ${user.email}`,
      );
    }

    await this.updateHistoryIdItems(input.currencyAccountHistoryId);

    /** Видалення historyId з currencyaccounts */
    const currencyAccountRes = await currencyAccount.updateOne({
      $pull: {
        historyId: mongo.ObjectId(input.currencyAccountHistoryId),
      },
      $set: {
        value: currencyAccount.value - historyItem.value,
      },
    });

    await historyItem.remove();

    if (!currencyAccountRes.ok || !currencyAccountRes.nModified) {
      throw new Error('Помилка при видаленні');
    }

    return this.getCurrencyAccount(currencyAccount.id, {
      numberOfHistoryItems: input.numberOfHistoryItems,
      historyPage: input.historyPage,
    });
  }
}
