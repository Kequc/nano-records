import {default as Err} from './err';
import {default as Db} from './db';
import {default as DocAttachment} from './doc/attachment';
import deepExtend = require('deep-extend');

export default class Doc
{
  body: { [index: string]: any };
  
  db: Db;
  attachment: DocAttachment;
  
  constructor (db: Db, body: { [index: string]: any } = {})
  {
    this.db = db;
    this.body = deepExtend({}, body);
    this.attachment = new DocAttachment(this);
  }
  
  getId (): string
  {
    return this.body['_id'] || null;
  }
  
  getRev (): string
  {
    return this.body['_rev'] || null;
  }
  
  getBody (): { [index: string]: any }
  {
    return deepExtend({}, this.body);
  }
  
  retrieveLatest (callback: (err?: Err)=>any = ()=>{})
  {
    if (!this.getId()) {
      callback(Err.missing('doc'));
      return;
    }
    this._performRetrieveLatest((err, result) => {
      if (err)
        callback(err);
      else {
        this.body = result;
        callback(); // up to date
      }
    });
  }
  
  private _performRetrieveLatest (callback: (err: Err, result: { [index: string]: any })=>any)
  {
    this.db.raw.get(this.getId(), (err: any, result: any) => {
      callback(Err.make('doc', err), result);
    });
  }
  
  update (body: Object, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(Err.missing('doc'));
      return;
    }
    tries++;
    this._performUpdate(body, (err, result) => {
      if (err) {
        if (tries <= this.db.maxTries && err.name == "conflict") {
          this.retrieveLatest((err) => {
            if (err)
              callback(err);
            else
              this.update(body, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        this.body = this._extendBody(body);
        this.body['_rev'] = result['rev'];
        callback(); // success
      }
    });
  }
  
  private _performUpdate (body: { [index: string]: any }, callback: (err: Err, result: { [index: string]: any })=>any)
  {
    this.db.raw.insert(this._extendBody(body), (err: any, result: any) => {
      callback(Err.make('doc', err), result);
    });
  }
  
  private _extendBody (body: { [index: string]: any }): { [index: string]: any }
  {
    return deepExtend({}, this.body, body);
  }
  
  erase (callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(); // nothing to see here
      return;
    }
    tries++;
    this._performErase((err) => {
      if (err) {
        if (tries <= this.db.maxTries && err.name == "conflict") {
          this.retrieveLatest((err) => {
            if (err)
              callback(err);
            else
              this.erase(callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        this.body = {};
        callback(); // success
      }
    });
  }
  
  private _performErase (callback: (err: Err)=>any)
  {
    this.db.raw.destroy(this.getId(), this.getRev(), (err: any) => {
      callback(Err.make('doc', err));
    });
  }
}
