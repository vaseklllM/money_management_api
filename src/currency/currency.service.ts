import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrencyModel } from './models/currency.model';
import { CurrencyHistoryModel } from './models/currency-history.model';
import { Currency, CurrencyDocument } from './schemas/currency.schema';
import fetch from 'node-fetch';
import {
  CurrencyHistory,
  CurrencyHistoryDocument,
} from './schemas/currency-history.schema';
import { CurrenciesArgs } from './dto/args/currencies.args';
import { mongo } from 'src/utils';
import { CurrencyArgs } from './dto/args/currency.args';

const dataUpdateTimeHours = 24;

const defaultData = [
  {
    ISOCode: 980,
    code: 'UAH',
    symbol: '₴',
    historyCourseInUAH: [],
  },
  {
    ISOCode: 840,
    code: 'USD',
    symbol: '$',
    historyCourseInUAH: [],
  },
  {
    ISOCode: 978,
    code: 'EUR',
    symbol: '€',
    historyCourseInUAH: [],
  },
];

interface ICurrencyCourses {
  r030: number;
  txt: string;
  rate: number /** ціна */;
  cc: string;
  exchangedate: string;
}

@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel(CurrencyHistory.name)
    private currencyHistoryModel: Model<CurrencyHistoryDocument>,
    @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
  ) {}

  /** курси валют до гривні */
  private async getCurrencyCourses(): Promise<ICurrencyCourses[]> {
    const response = await fetch(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json',
    );

    const currenciesText: string = await response.text();
    const currencies: ICurrencyCourses[] = JSON.parse(currenciesText);

    return currencies;
  }

  private async createDefaultCurrencies() {
    const currencyCourses: ICurrencyCourses[] = await this.getCurrencyCourses();

    for await (const currency of defaultData) {
      const currencyHistory = new this.currencyHistoryModel({
        date: new Date(),
        price: currencyCourses.find((i) => i.cc === currency.code)?.rate || 1,
      });

      await currencyHistory.save();

      currency.historyCourseInUAH.push(currencyHistory._id);
    }

    const res = await this.currencyModel.create(defaultData);

    return res;
  }

  private async checkIsCreateCurrencies() {
    const currencies = await this.currencyModel.find();
    /** Якщо немає валют за то вони генеруються за замовчуванням */
    if (currencies.length === 0) await this.createDefaultCurrencies();
  }

  private async getCurrencyByIdAllInfo(
    id: string,
    args: CurrenciesArgs,
  ): Promise<CurrencyModel> {
    const currency = await this.currencyModel.findById(id, {
      _id: 1,
      ISOCode: 1,
      code: 1,
      symbol: 1,
    });

    const historyCourseInUAH =
      await this.currencyModel.aggregate<CurrencyHistoryModel>([
        { $match: { _id: mongo.ObjectId(id) } },
        {
          $lookup: {
            from: 'currencyhistories',
            localField: 'historyCourseInUAH',
            foreignField: '_id',
            as: 'historyCourseInUAH',
          },
        },
        {
          $unwind: '$historyCourseInUAH',
        },
        { $sort: { 'historyCourseInUAH.date': -1 } },
        { $limit: args.numberOfHistoryItems || 1 },
        {
          $project: {
            _id: 0,
            id: '$historyCourseInUAH._id',
            date: '$historyCourseInUAH.date',
            price: '$historyCourseInUAH.price',
          },
        },
      ]);

    return {
      ISOCode: currency.ISOCode,
      code: currency.code,
      id: currency._id,
      symbol: currency.symbol,
      historyCourseInUAH,
    };
  }

  /** Повертає всі валюти */
  private async getAllCurrenciesPrivate(
    args: CurrenciesArgs,
  ): Promise<CurrencyModel[]> {
    const currencyIds = await this.currencyModel.find({}, { _id: 1 });

    const currencies: CurrencyModel[] = [];

    for await (const currencyId of currencyIds) {
      const currency = await this.getCurrencyByIdAllInfo(
        String(currencyId._id),
        args,
      );
      currencies.push(currency);
    }

    return currencies;
  }

  /** оновлення курсів в uah */
  private async updateHistoryCourseInUAH() {
    const currencyCourses: ICurrencyCourses[] = await this.getCurrencyCourses();
    const currencies = await this.currencyModel.find();

    for await (const currency of currencies) {
      const currencyHistory = new this.currencyHistoryModel({
        date: new Date(),
        price: currencyCourses.find((i) => i.cc === currency.code)?.rate || 1,
      });

      await currencyHistory.save();

      const currencyDb = await this.currencyModel.findById(currency._id);

      await currencyDb.update({
        $push: {
          historyCourseInUAH: {
            $each: [currencyHistory._id],
            $position: 0,
          },
        },
      });
    }
  }

  /** перевірка на оновлення курсів */
  private async checkIsUpdateHistoryCourseInUAH() {
    const currencies = await this.currencyModel.aggregate([
      {
        $lookup: {
          from: 'currencyhistories',
          localField: 'historyCourseInUAH',
          foreignField: '_id',
          as: 'historyCourseInUAH',
        },
      },
      {
        $match: {
          code: 'USD',
        },
      },
      {
        $unwind: '$historyCourseInUAH',
      },
      { $sort: { 'historyCourseInUAH.date': -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          date: '$historyCourseInUAH.date',
        },
      },
    ]);

    if (typeof currencies[0].date === 'object') {
      const diff = new Date().getTime() - currencies[0].date.getTime();
      const hours = diff / 1000 / 60 / 60;

      if (hours > dataUpdateTimeHours) {
        await this.updateHistoryCourseInUAH();
      }
    }
  }

  async getAllCurrencies(args: CurrenciesArgs): Promise<CurrencyModel[]> {
    /** установка значень за замовчуванням */
    await this.checkIsCreateCurrencies();
    /** оновлення значень */
    await this.checkIsUpdateHistoryCourseInUAH();

    return this.getAllCurrenciesPrivate(args);
  }

  async getCurrencyById(args: CurrencyArgs): Promise<CurrencyModel> {
    /** установка значень за замовчуванням */
    await this.checkIsCreateCurrencies();
    /** оновлення значень */
    await this.checkIsUpdateHistoryCourseInUAH();

    return await this.getCurrencyByIdAllInfo(args.id, {
      numberOfHistoryItems: args.numberOfHistoryItems,
    });
  }
}
