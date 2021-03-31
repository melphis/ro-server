import { Injectable, OnModuleInit } from '@nestjs/common';
import { open, Database } from 'sqlite';
import * as sqlite3 from 'sqlite3';
import { IItem, Item } from '@models/index';

@Injectable()
export class DatabaseService implements OnModuleInit {
  protected static db: Database;

  public path = '/mnt/d/rodb.sqlite';

  async onModuleInit(): Promise<void> {
    DatabaseService.db = await open({
      filename: this.path,
      driver: sqlite3.Database,
    });

    console.error('DB: initialized');

    DatabaseService.db.on('trace', (data) => {
      // console.error('DB:', data);
    });
  }

  async getLastUpdate() {
    const value = await DatabaseService.db.get<string>(
      'SELECT last_update from config',
    );
    return new Date(value || 0);
  }

  setLastUpdate(date: Date) {
    DatabaseService.db.run(`update config set last_update = ${date.toJSON()}`);
  }

  async allItems(): Promise<Item[]> {
    const data = await DatabaseService.db.all<IItem[]>('select * from items');

    return data.map((i) => {
      const item = new Item(i.name, i.item_id);
      item.id = i.id;
      return item;
    });
  }

  async createItem(item: Item) {
    await item.create(DatabaseService.db);
  }
}
