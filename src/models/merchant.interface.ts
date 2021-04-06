import { IPos } from '@models/pos.interface';
import { CURRENCY } from '@models/CURRENCY';

export interface IMerchant {
  id?: number;
  name: string;
  shopName: string;
  pos: IPos;
  currency: CURRENCY;
  lastUpdate: Date;
  snapId: number;
}
