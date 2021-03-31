import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Merchant, IMerchant, CURRENCY, IPos, Lot } from '@models/index';

@Injectable()
export class MerchantsService extends DatabaseService implements OnModuleInit {
  list: Merchant[] = [];

  async onModuleInit(): Promise<void> {
    return Promise.resolve();
  }

  private async find(name: string): Promise<Merchant> {
    let merchant: Merchant;
    const data: IMerchant = await DatabaseService.db.get<IMerchant>(
      'select * from merchants where name = ?',
      [name],
    );

    if (data) {
      const pos = {
        left: data.pos_left,
        top: data.pos_top,
      };

      merchant = new Merchant(
        data.name,
        data.shop_name,
        pos,
        data.currency,
        new Date(data.last_update),
      );

      merchant.id = data.id;
      this.list.push(merchant);
    }

    return merchant;
  }

  async get(name): Promise<Merchant> {
    let merch = this.list.find((merch) => merch.name === name);

    if (!merch) {
      merch = await this.find(name);
    }

    return merch;
  }

  async updateOrCreate(
    name: string,
    shopName: string,
    pos: IPos,
    currency: CURRENCY,
    lastUpdate: Date,
  ): Promise<Merchant> {
    let merchant = await this.get(name);

    if (merchant) {
      await merchant.update(DatabaseService.db);
    } else {
      merchant = new Merchant(name, shopName, pos, currency, lastUpdate);
      await merchant.create(DatabaseService.db);
    }

    return merchant;
  }

  save() {
    this.list.forEach((merch: Merchant) => {
      merch.lots.forEach((lot: Lot) => lot.create(DatabaseService.db));
    });
  }
}
