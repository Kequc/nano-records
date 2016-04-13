import {default as Db} from './db';
import {default as DocAttachment} from './doc/attachment';
import deepExtend = require('deep-extend');

export default class Doc
{
  body: { [index: string]: any };
  
  db: Db;
  attachment: DocAttachment;
  
  constructor (db: Db, body: Object = {})
  {
    this.db = db;
    this.body = body;
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
  
  hasAttachment (name: string): boolean
  {
    return !!(this.body['_attachments'] && this.body['_attachments'][name]);
  }
  
  retrieveLatest (callback: Function = ()=>{})
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performRetrieveLatest((err: Error, result: Object) => {
      if (err)
        callback(err);
      else {
        this.body = result;
        callback(null); // up to date
      }
    });
  }
  
  private _performRetrieveLatest (callback: Function)
  {
    return this.db.raw.get(this.getId(), callback);
  }
  
  update (body: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performUpdate(body, (err: Error, result: { [index: string]: any }) => {
      if (err) {
        if (tries <= this.db.maxTries) {
          this.retrieveLatest((err: Error) => {
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
  
  private _performUpdate (body: Object, callback: Function)
  {
    return this.db.raw.insert(this._extendBody(body), callback);
  }
  
  private _extendBody(body: Object): Object
  {
    return deepExtend({}, this.body, body);
  }
  
  destroy (callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performDestroy((err: Error) => {
      if (err) {
        if (tries <= this.db.maxTries) {
          this.retrieveLatest((err: Error) => {
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
  
  private _performDestroy (callback: Function)
  {
    return this.db.raw.destroy(this.getId(), this.getRev(), callback);
  }
}
