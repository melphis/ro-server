import { CURRENCY, IDbModel, Item } from '@models/index';
import { Client } from 'pg';

export class Lot implements IDbModel {
  id: number;

  constructor(
    public merchantId: number,
    public item: Item,
    public amount: number,
    public currency: CURRENCY,
    public price: number,
    public refine: number,
    public insertDate: Date,
    public snapId: number,
    public cards: Item[] = [],
  ) {}

  async create(db: Client): Promise<void> {
    const result = await db.query(
      `
insert into ro.lots
(merchant_id, item_id, amount, price, refine, currency, insert_date, snap_id)
values($1, $2, $3, $4, $5, $6, $7, $8)`,
      this.getValues(),
    );

    this.id = result.oid;
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
      this.snapId,
    ];
  }

  async update(db: Client): Promise<void> {
    return Promise.resolve();
  }
}
