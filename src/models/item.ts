import { IDbModel } from '@models/index';
import { Database } from 'sqlite';

export interface IItem {
  id: number;
  name: string;
  item_id: number;
}

export class Item implements IDbModel {
  public id: number;

  constructor(public name: string, public itemId: number) {}

  async create(db: Database): Promise<void> {
    const result = await db.run(
      `
insert into items
(name, item_id)
values(?, ?)`,
      this.getValues(),
    );

    this.id = result.lastID;
  }

  getValues(): any[] {
    return [this.name, this.itemId];
  }

  update(db: Database): Promise<void> {
    return Promise.resolve();
  }
}
