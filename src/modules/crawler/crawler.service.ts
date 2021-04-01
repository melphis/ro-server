import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { parse } from 'node-html-parser';
import { Merchant, CURRENCY, Item, Lot, IPos } from '@models/index';
import { MerchantsService } from '../database/merchants.service';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import fetch from 'node-fetch';

type TFetchedPage = AsyncGenerator<{ index: number; page: HTMLElement }>;

interface ILotProcessed {
  merchantIndex: number;
  lotIndex: number;
}

@Injectable()
export class CrawlerService implements OnModuleInit {
  private static checkoutTimeout = 5 * 60 * 1000;

  path = 'https://nya.playdf.org/?module=vending&nameid_order=asc&p=';
  currentPage = 1;
  dateNow: Date;
  lastWorkTime: string;
  items: Item[];
  noNextPageError = new Error('Все страницы спаршены');
  wip$ = new BehaviorSubject<boolean>(false);
  lotProcessed$ = new Subject<ILotProcessed>();
  pageParsed$ = new Subject<number>();

  constructor(
    private db: DatabaseService,
    private merchants: MerchantsService,
  ) {}

  onModuleInit() {
    fromPromise(this.db.allItems())
      .pipe(
        tap((items) => (this.items = items)),
        switchMap(() => timer(0, CrawlerService.checkoutTimeout)),
        concatMap(() => {
          this.wip$.next(true);
          return fromPromise(this.run());
        }),
        concatMap(() => fromPromise(this.merchants.saveLots())),
      )
      .subscribe(() => {
        this.dateNow = new Date();
        this.lastWorkTime = CrawlerService.calcWorkTime(this.dateNow);
        this.wip$.next(false);
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

  private static calcWorkTime(
    startDate: Date,
    endDate: Date = new Date(),
  ): string {
    return new Date(endDate.getTime() - startDate.getTime())
      .toUTCString()
      .match(/\d+:\d+:\d+/)[0];
  }

  private runStub() {
    console.log('Run stub called');
    return new Promise((r) => setTimeout(r, 1000));
  }

  private async run() {
    console.log('Run called');

    for await (const { index, page } of this.fetchPages(this.currentPage)) {
      const rows = page.querySelector('table').querySelectorAll('tr');

      for (const row of rows) {
        await this.parseRow(row);
      }

      this.pageParsed$.next(index);

      if (process.stdout.cursorTo) {
        process.stdout.write(`Page ${index} parsed...`);
        process.stdout.cursorTo(0);
      }
    }
  }

  private async *fetchPages(index: number): TFetchedPage {
    while (true) {
      try {
        const page = await this.parsePage(index);
        yield { index, page };
        index++;
      } catch (e) {
        if (e === this.noNextPageError) {
          console.log(e.message);
        } else {
          console.error(e);
        }

        return;
      }
    }
  }

  private async parsePage(page: number): Promise<HTMLElement> {
    const res = await fetch(this.path + page);
    const body = await res.text();
    const root = parse(body);
    const alertMessage = root.querySelector('.alert.alert-warning');

    if (alertMessage && alertMessage.textContent.trim() === 'Nothing found') {
      console.log(`\n`);
      throw this.noNextPageError;
    }

    // @ts-ignore
    return root;
  }

  private async parseRow(row) {
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

  private async processItem(itemNode): Promise<Item> {
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
