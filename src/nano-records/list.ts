/* class List
 * 
 * Represents a single result set containing references
 * to documents but perhaps only limited data from
 * each of them.
 * 
 * Used in general for returned views.
 * 
 */

import {default as Err} from './err';
import {default as Db} from './db';
import {default as Doc} from './doc';
import _ = require('underscore');

export interface ErrListCallback {
  (err?: Err, list?: List): any;
}

export default class List
{
  total: number;
  offset: number;
  rows: ViewRow[];
  db: Db;
  
  constructor (db: Db, body: ViewResult)
  {
    this.db = db;
    this.total = body.total_rows;
    this.offset = body.offset;
    this.rows = body.rows;
  }
  
  ids (): string[]
  {
    return _.map(this.rows, (row: ViewRow) => { return row.id; });
  }
  
  keys (): any[]
  {
    return _.map(this.rows, (row: ViewRow) => { return row.key; });
  }
  
  values (): any[]
  {
    return _.map(this.rows, (row: ViewRow) => { return row.doc || row.value; });
  }
  
  docs (): Doc[]
  {
    return _.map(this.rows, (row: ViewRow) => { return new Doc(this.db, (row.doc || row.value), { id: row.id }) });
  }
  
  doc (index: number)
  {
    let row = this.rows[index];
    return (row ? new Doc(this.db, (row.doc || row.value), { id: row.id }) : undefined);
  }
}
