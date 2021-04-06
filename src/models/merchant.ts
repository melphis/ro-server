import { CURRENCY, IDbModel, IPos, Lot } from '@models/index';
import { Client } from 'pg';

export class Merchant implements IDbModel {
  id: number;

  constructor(
    public name: string,
    public shopName: string,
    public pos: IPos,
    public currency: CURRENCY,
    public lastUpdate: Date,
    public snapId: number,
    public lots: Lot[] = [],
  ) {}

  async create(db: Client): Promise<void> {
    if (this.id) {
      throw new Error(`Мерч с id ${this.id} уже существует.`);
    }

    const result = await db.query(
      `insert into ro.merchants
        (name, pos_top, pos_left, currency, shop_name, last_update, snap_id)
         values ($1, $2, $3, $4, $5, $6, $7)`,
      this.getValues().slice(0, 7),
    );

    this.id = result.oid;
  }

  async update(db: Client): Promise<void> {
    await db.query(
      `update ro.merchants
          set name = $1, pos_left = $2, pos_top = $3, currency = $4, shop_name = $5, last_update = $6, snap_id = $7
          where id = $8
        `,
      this.getValues(),
    );
  }

  addLot(lot) {
    this.lots.push(lot);
  }

  getValues(): any[] {
    return [
      this.name,
      this.pos.top,
      this.pos.left,
      this.currency,
      this.shopName,
      this.lastUpdate.toISOString().replace('T', ' ').replace('Z', ''),
      this.snapId,
      this.id,
    ];
  }
}
