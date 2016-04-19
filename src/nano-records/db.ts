import {default as Err} from './err';
import {default as Doc} from './doc';
import {default as DbDoc} from './db/doc';
import {default as DbDesign} from './db/design';
import deepExtend = require('deep-extend');

export interface iDesignInput {
  language?: string,
  shows?: { [index: string]: string };
  views?: { [index: string]: { map: string, reduce: string }};
}

export default class Db
{
  maxTries: number = 5;
  nano: any;
  dbName: string;
  designs: { [index: string]: iDesignInput } = {};
  raw: any;
  
  doc: DbDoc;
  design: DbDesign;
  
  constructor (nano: any, dbName: string, designs: { [index: string]: iDesignInput } = {})
  {
    this.nano = nano;
    this.dbName = dbName;
    this.raw = this.nano.use(this.dbName);
    
    for (let key in designs) {
      this.designs[key] = {
        language: "javascript",
        shows: {},
        views: {}
      };
    }
    deepExtend(this.designs, designs);
    
    this.doc = new DbDoc(this);
    this.design = new DbDesign(this);
  }
  
  create (callback: (err: Err)=>any = ()=>{})
  {
    this._performCreate((err) => {
      if (err)
        callback(err);
      else
        callback(null);
    });
  }
  
  private _performCreate (callback: (err: Err)=>any)
  {
    this.nano.db.create(this.dbName, (err: any) => {
      callback(Err.make('db', err));
    });
  }
}
