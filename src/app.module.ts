import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { BankCardsModule } from './bank-cards/bank-cards.module';
import { CurrencyModule } from './currency/currency.module';
import { CurrencyAccountsModule } from './currency-accounts/currency-accounts.module';
import { CurrencyAccountsHistoryModule } from './currency-accounts-history/currency-accounts-history.module';
import { SettingsModule } from './settings/settings.module';

const environment = process.env.NODE_ENV || 'development';
@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      // context: ({ req, res }) => ({ req, res }),
      // installSubscriptionHandlers: true,
    }),
    ConfigModule.forRoot({
      envFilePath: `.env.${environment}`,
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_WRITE_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    AuthModule,
    BankCardsModule,
    CurrencyModule,
    CurrencyAccountsModule,
    CurrencyAccountsHistoryModule,
    SettingsModule,
  ],
})
export class AppModule {}
