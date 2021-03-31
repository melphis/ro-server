import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../modules/database/database.service';
import { parse } from 'node-html-parser';
import request = require('request');
import { Merchant, CURRENCY, Item, Lot, IPos } from '@models/index';
import { timer } from 'rxjs';
import { MerchantsService } from '../modules/database/merchants.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { switchMap, tap } from 'rxjs/operators';

@Injectable()
export class CrawlerService implements OnModuleInit {
  path = 'https://nya.playdf.org/?module=vending&nameid_order=asc&p=';
  currentPage = 1;
  dateNow: Date;
  items: Item[];

  constructor(
    private db: DatabaseService,
    private merchants: MerchantsService,
  ) {}

  onModuleInit() {
    fromPromise(this.db.allItems())
      .pipe(
        tap((items) => (this.items = items)),
        switchMap(() => timer(0, 5 * 60 * 1000)),
      )
      .subscribe(async () => {
        this.dateNow = new Date();
        console.time();
        await this.run();
        console.timeEnd();
      });
  }

  private static parseItem(node): Item {
    const link = node.querySelector('a');
    const id = parseInt(link.attrs.href.match(/\d+$/)[0], 10);
    const name = link.text.trim();

    return new Item(name, id);
  }

  private static parsePos(pos: string): IPos {
    const matches = pos.match(/\d+/g);
    return {
      top: parseInt(matches[0], 10),
      left: parseInt(matches[1], 10),
    };
  }

  private static parseCurrency(cur: string): CURRENCY {
    return CURRENCY[cur.trim().replace(/\s+/, '_').toUpperCase()];
  }

  async run() {
    console.log('Run called');

    try {
      while (true) {
        await this.parsePage(this.currentPage);
        // throw new Error('Убрать эту ошибку');
        this.currentPage++;
      }
    } catch (e) {
      console.log(e);
      this.currentPage = 1;
      this.merchants.save();
    }
  }

  async parsePage(page: number): Promise<void> {
    return new Promise((resolve, reject) => {
      request(this.path + page, async (error, response, body) => {
        const root = parse(body);
        const alertMessage = root.querySelector('.alert.alert-warning');

        if (
          alertMessage &&
          alertMessage.textContent.trim() === 'Nothing found'
        ) {
          return reject('Все страницы спаршены');
        }

        const rows = root.querySelector('table').querySelectorAll('tr');

        for (const row of rows) {
          await this.parseRow(row);
        }

        process.stdout.write(`Page ${page} parsed...`);
        process.stdout.cursorTo(0);
        resolve();
      });
    });
  }

  async parseRow(row) {
    let [
      shopName,
      merchantName,
      pos,
      itemImageNode,
      itemNode,
      amount,
      currency,
      price,
      refine,
      cardsNode,
    ] = row.querySelectorAll('td');

    if (!shopName) {
      return;
    }

    const item: Item = await this.processItem(itemNode);

    shopName = shopName.text.trim();
    merchantName = merchantName.text.trim();
    pos = CrawlerService.parsePos(pos.text);
    amount = parseInt(amount.text, 10);
    currency = CrawlerService.parseCurrency(currency.text);
    price = parseInt(price.text.replace(',', ''), 10);
    refine = parseInt(refine.text, 10) || 0;

    // TODO: добавить карты
    const merchant: Merchant = await this.merchants.updateOrCreate(
      merchantName,
      shopName,
      pos,
      currency,
      this.dateNow,
    );

    const lot = new Lot(
      merchant.id,
      item,
      amount,
      currency,
      price,
      refine,
      this.dateNow,
    );

    merchant.addLot(lot);
  }

  async processItem(itemNode): Promise<Item> {
    let item: Item = CrawlerService.parseItem(itemNode);
    const cachedItem: Item = this.items.find(
      (i: Item) => i.itemId === item.itemId,
    );

    if (cachedItem) {
      item = cachedItem;
    } else {
      await this.db.createItem(item);
      this.items.push(item);
    }

    return item;
  }
}
