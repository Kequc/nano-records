import {default as Db, iNanoError} from './db';
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
  
  retrieveLatest (callback: (err?: Error)=>any = ()=>{})
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performRetrieveLatest((err, result) => {
      if (err)
        callback(err);
      else {
        this.body = result;
        callback(null); // up to date
      }
    });
  }
  
  private _performRetrieveLatest (callback: (err: iNanoError, result: { [index: string]: any })=>any)
  {
    this.db.raw.get(this.getId(), callback);
  }
  
  update (body: Object, callback: (err?: Error)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performUpdate(body, (err, result) => {
      if (err) {
        if (tries <= this.db.maxTries && err.statusCode == 409) {
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
        callback(null); // success
      }
    });
  }
  
  private _performUpdate (body: { [index: string]: any }, callback: (err: iNanoError, result: { [index: string]: any })=>any)
  {
    this.db.raw.insert(this._extendBody(body), callback);
  }
  
  private _extendBody (body: { [index: string]: any }): { [index: string]: any }
  {
    return deepExtend({}, this.body, body);
  }
  
  destroy (callback: (err?: Error)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performDestroy((err) => {
      if (err) {
        if (tries <= this.db.maxTries && err.statusCode == 409) {
          this.retrieveLatest((err) => {
            if (err)
              callback(err);
            else
              this.destroy(callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        this.body = {};
        callback(null); // success
      }
    });
  }
  
  private _performDestroy (callback: (err: iNanoError)=>any)
  {
    this.db.raw.destroy(this.getId(), this.getRev(), callback);
  }
}
