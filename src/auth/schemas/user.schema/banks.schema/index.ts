import { Prop, Schema } from '@nestjs/mongoose';
import { Bank } from './bank.schema';

@Schema()
export class Banks {
  @Prop({ type: Bank })
  monobank: Bank;

  @Prop({ type: Bank })
  privatbank: Bank;

  @Prop({ type: Bank })
  oshadbank: Bank;
}
