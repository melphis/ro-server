import { Injectable, OnModuleInit } from '@nestjs/common';
import { IItem, Item } from '@models/index';
import { Subject } from 'rxjs';
import { Client } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  db: Client;
  db$ = new Subject<Client>();

  async onModuleInit(): Promise<void> {
    this.db = new Client({
      user: 'root',
      host: '194.67.111.161',
      database: 'parser',
      password: 'Xncnmmc32',
      port: 5433,
    });
    await this.db.connect();

    /*this.db = await open({
      filename: this.path,
      driver: sqlite3.Database,
    });*/

    this.db$.next(this.db);

    console.error('DB: initialized');
  }

  async allItems(): Promise<Item[]> {
    const res = await this.db.query<IItem>('select * from ro.items');

    return res.rows.map((i) => {
      const item = new Item(i.name, i.item_id);
      item.id = i.id;
      return item;
    });
  }

  async createItem(item: Item) {
    await item.create(this.db);
  }
}
