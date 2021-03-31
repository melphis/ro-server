import { CURRENCY, IDbModel, IPos, Lot } from '@models/index';
import { Database } from 'sqlite';

export class Merchant implements IDbModel {
  id: number;

  constructor(
    public name: string,
    public shopName: string,
    public pos: IPos,
    public currency: CURRENCY,
    public lastUpdate: Date,
    public lots: Lot[] = [],
  ) {}

  async create(db: Database): Promise<void> {
    if (this.id) {
      throw new Error(`Мерч с id ${this.id} уже существует.`);
    }

    const result = await db.run(
      `insert into merchants
        (name, pos_top, pos_left, currency, shop_name, last_update)
         values (?, ?, ?, ?, ?, ?)`,
      this.getValues(),
    );

    this.id = result.lastID;
  }

  async update(db: Database): Promise<void> {
    await db.run(
      `update merchants
          set name = ?, pos_left = ?, pos_top = ?, currency = ?, shop_name = ?, last_update = ?
          where id = ?
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
      this.lastUpdate,
    ];
  }
}
