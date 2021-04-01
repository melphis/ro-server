import { IDbModel } from '@models/index';
import { Client } from 'pg';

export interface IItem {
  id: number;
  name: string;
  item_id: number;
}

export class Item implements IDbModel {
  public id: number;

  constructor(public name: string, public itemId: number) {}

  async create(db: Client): Promise<void> {
    const result = await db.query(
      `
insert into ro.items
(name, item_id)
values($1, $2)`,
      this.getValues(),
    );

    this.id = result.oid;
  }

  getValues(): any[] {
    return [this.name, this.itemId];
  }

  update(db: Client): Promise<void> {
    return Promise.resolve();
  }
}
