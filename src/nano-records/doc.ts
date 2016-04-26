/* class Doc
 * 
 * Manages a single instance of a single document in the database.
 * Methods called within this class do not take an `_id` parameter
 * and in general will stop working if the document no longer has
 * one. Ie. If the record was deleted.
 * 
 * All methods assume that a database exists.
 * 
 */

import {default as Err} from './err';
import {default as Db} from './db';
import {default as DocAttachment} from './doc/attachment';
import deepExtend = require('deep-extend');

export default class Doc
{
  body: { [index: string]: any } = {};
  _latestRev: string;
  
  db: Db;
  attachment: DocAttachment;
  
  constructor (db: Db, body: { [index: string]: any } = {}, result: { [index: string]: any } = {})
  {
    this.db = db;
    this.attachment = new DocAttachment(this);

    deepExtend(this.body, body);
    this.body['_id'] = result['id'] || this.body['_id'];
    this.body['_rev'] = this._latestRev = result['rev'] || this.body['_rev'];
  }
  
  read (callback: (err?: Err)=>any = ()=>{})
  {
    if (!this.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performRead((err, result) => {
      if (err)
        callback(err);
      else {
        this.body = result;
        this._latestRev = result['_rev'];
        callback(); // up to date
      }
    });
  }
  
  private _performRead (callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.get(this.getId(), Err.resultFunc('doc', callback));
  }
  
  write (body: { [index: string]: any }, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    tries++;
    this._performWrite(body, (err, result) => {
      if (err) {
        if (tries <= this.db.maxTries && err.name == "conflict") {
          this.head((err) => {
            if (err)
              callback(err);
            else
              this.write(body, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        this.body = deepExtend({}, body);
        this.body['_id'] = result['id'];
        this.body['_rev'] = this._latestRev = result['rev'];
        callback(); // success
      }
    });
  }
  
  private _performWrite (body: { [index: string]: any }, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.insert(deepExtend({}, body, { '_id': this.getId(), '_rev': this._latestRev }), Err.resultFunc('doc', callback));
  }
  
  update (body: { [index: string]: any }, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    tries++;
    this._performUpdate(body, (err, result) => {
      if (err) {
        if (tries <= this.db.maxTries && err.name == "conflict") {
          this.read((err) => {
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
        this.body['_rev'] = this._latestRev = result['rev'];
        callback(); // success
      }
    });
  }
  
  private _performUpdate (body: { [index: string]: any }, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    if (this.getRev() !== this._latestRev)
      callback(Err.conflict('doc'));
    else
      this.db.raw.insert(this._extendBody(body), Err.resultFunc('doc', callback));
  }
  
  private _extendBody (body: { [index: string]: any }): { [index: string]: any }
  {
    return deepExtend({}, this.body, body);
  }
  
  destroy (callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    tries++;
    this._performDestroy((err) => {
      if (err) {
        if (tries <= this.db.maxTries && err.name == "conflict") {
          this.head((err) => {
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
        callback(); // success
      }
    });
  }
  
  private _performDestroy (callback: (err: Err)=>any)
  {
    this.db.raw.destroy(this.getId(), this._latestRev, Err.resultFunc('doc', callback));
  }
  
  head (callback: (err?: Err, rev?: string, data?: any)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    this.db.doc.head(this.getId(), (err, rev, data) => {
      if (rev)
        this._latestRev = rev;
      callback(err, rev, data);
    });
  }
  
  getId (): string
  {
    return this.body['_id'];
  }
  
  getRev (): string
  {
    return this.body['_rev'];
  }
  
  getBody (): { [index: string]: any }
  {
    return deepExtend({}, this.body);
  }
}
