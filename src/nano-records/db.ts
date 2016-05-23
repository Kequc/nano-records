/* class Db
 * 
 * Maintains a set of core settings for the database instance.
 * Also offers some basic database functions such as create and
 * destroy.
 * 
 * Delivers an entry point into all other classes.
 * 
 */

import {default as Err, ErrCallback} from './err';
import {default as Doc} from './doc';
import {default as DbDoc} from './db/doc';
import {default as DbView} from './db/view';
import {default as DbShow} from './db/show';
import deepExtend = require('deep-extend');

export default class Db
{
  maxTries: number = 5;
  nano: any;
  dbName: string;
  designs: DesignInputs = {};
  raw: any;
  
  doc: DbDoc;
  view: DbView;
  show: DbShow;
  
  constructor (nano: any, dbName: string, designs?: DesignInputs)
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
    this.view = new DbView(this);
    this.show = new DbShow(this);
  }
  
  create (callback: ErrCallback = ()=>{})
  {
    this._performCreate(callback);
  }
  
  private _performCreate (callback: ErrCallback)
  {
    this.nano.db.create(this.dbName, Err.resultFunc('db', callback));
  }
  
  destroy (verify: string, callback: ErrCallback = ()=>{})
  {
    if (verify !== "_DESTROY_")
      callback(Err.verifyFailed('db'));
    else
      this._performDestroy(callback);
  }
  
  private _performDestroy (callback: ErrCallback)
  {
    this.nano.db.destroy(this.dbName, Err.resultFunc('db', callback));
  }
  
  reset (verify: string, callback: ErrCallback = ()=>{})
  {
    if (verify !== "_RESET_")
      callback(Err.verifyFailed('db'));
    else {
      this.destroy("_DESTROY_", (err) => {
        if (!err || err.name == "no_db_file")
          this.create(callback);
        else
          callback(err);
      });
    }
  }
}
