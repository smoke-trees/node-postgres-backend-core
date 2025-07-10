import { EntityManager } from "typeorm";
import Database from "./database";

export class Sequence {
  private _sequenceName: string;

  public get sequenceName(): string {
    return this._sequenceName;
  }

  public set sequenceName(value: string) {
    this._sequenceName = value;
  }

  private _database: Database;

  /**
   *
   * @param name Name of the sequence
   */
  constructor(database: Database, sequenceName: string) {
    this._database = database;
    this._sequenceName = sequenceName;
  }

  /**
   * Increment the sequence and returns the new value
   * @returns Next Value in sequence
   */
  async getNextValue(manager?: EntityManager): Promise<number> {
    if (!manager) {
      manager = this._database.getConnection().createEntityManager();
    }
    const query = `select nextval('${this._sequenceName}')`;

    const queryResult = await manager.query(query);

    if (queryResult.length > 0) {
      return parseInt(queryResult[0].nextval);
    }
    return 0;
  }

  /**
   * Get current value in the sequence
   * @returns Current Value in sequence
   */
  async getLastValue(manager?: EntityManager): Promise<number> {
    if (!manager) {
      manager = this._database.getConnection().createEntityManager();
    }
    const query = `select currval('${this._sequenceName}')`;

    const queryResult = await manager.query(query);

    if (queryResult.length > 0) {
      return queryResult[0].currval;
    }
    return 0;
  }
}

export default Sequence;
