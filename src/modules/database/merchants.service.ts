import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { IMerchant } from '../database/models/index';
import { first } from 'rxjs/operators';

import { IMerchant as IMerchantModel, Merchant } from '@models/index';

@Injectable()
export class MerchantsService implements OnModuleInit {
  list: Merchant[];

  constructor(private dbService: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    if (!this.dbService.db) {
      await this.dbService.db$.pipe(first()).toPromise();
    }

    this.list = await this.all();
  }

  private async all(): Promise<Merchant[]> {
    const merchantsData = (
      await this.dbService.db.query<IMerchant>('select * from ro.merchants')
    ).rows;

    return merchantsData.map((i) => {
      const merch = new Merchant(
        i.name,
        i.shop_name,
        { top: i.pos_top, left: i.pos_left },
        i.currency,
        new Date(i.last_update),
        i.snap_id,
      );

      merch.id = i.id;
      return merch;
    });
  }

  private async find(name: string): Promise<Merchant> {
    let merchant: Merchant;
    const data: IMerchant = (
      await this.dbService.db.query<IMerchant>(
        'select * from ro.merchants where name = $1',
        [name],
      )
    ).rows[0];

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
        data.snap_id,
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

  async updateOrCreate(data: IMerchantModel): Promise<Merchant> {
    let merchant = await this.get(data.name);

    if (merchant) {
      if (merchant.lastUpdate?.getTime() !== data.lastUpdate.getTime()) {
        Object.assign(merchant, data);
        await merchant.update(this.dbService.db);
      }
    } else {
      merchant = new Merchant(
        data.name,
        data.shopName,
        data.pos,
        data.currency,
        data.lastUpdate,
        data.snapId,
      );
      await merchant.create(this.dbService.db);
      this.list.push(merchant);
    }

    return merchant;
  }

  async saveLots() {
    let lotIndex = 1;

    const lotsCount = this.list.reduce(
      (sum: number, merch: Merchant) => sum + merch.lots.length,
      0,
    );

    for (const [index, merch] of this.list.entries()) {
      for (const lot of merch.lots) {
        await lot.create(this.dbService.db);

        if (process.stdout.cursorTo) {
          process.stdout.cursorTo(0);
          process.stdout.write(
            `Мерчей ${index + 1} из ${
              this.list.length
            }. Лотов ${lotIndex} из ${lotsCount}`,
          );
        }

        lotIndex++;
      }
    }

    console.log();
  }
}
