import { Client } from 'pg';

export interface IDbModel {
  create(db: Client): Promise<void>;
  update(db: Client): Promise<void>;
  getValues(): any[];
}
