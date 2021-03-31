import { CURRENCY, IDbModel, Item } from '@models/index';
import { Database } from 'sqlite';

export class Lot implements IDbModel {
  constructor(
    public merchantId: number,
    public item: Item,
    public amount: number,
    public currency: CURRENCY,
    public price: number,
    public refine: number,
    public insertDate: Date,
    public cards: Item[] = [],
  ) {}

  async create(db: Database): Promise<void> {
    await db.run(
      `
insert into lots
(merchant_id, item_id, amount, price, refine, currency, insert_date)
values(?, ?, ?, ?, ?, ?, ?)`,
      this.getValues(),
    );
  }

  getValues(): any[] {
    return [
      this.merchantId,
      this.item.id,
      this.amount,
      this.price,
      this.refine,
      this.currency,
      this.insertDate,
    ];
  }

  async update(db: Database): Promise<void> {
    return Promise.resolve();
  }
}
