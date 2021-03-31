import { Database } from 'sqlite';

export interface IDbModel {
  create(db: Database): Promise<void>;
  update(db: Database): Promise<void>;
  getValues(): any[];
}
