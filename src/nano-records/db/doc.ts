/* class DbDoc
 * 
 * Acts as an entry point to this library's document interfaces.
 * Expects a id to be specified on almost every operation and generally
 * returns a Doc instance.
 * 
 * Most methods mirror those which are available on the Doc
 * class.
 * 
 */

import {default as Err} from '../err';
import {default as Db} from '../db';
import {default as Doc} from '../doc';
import {default as DbDocAttachment} from './doc/attachment';
import deepExtend = require('deep-extend');

export default class DbDoc
{
  db: Db;
  attachment: DbDocAttachment;
  
  constructor (db: Db)
  {
    this.db = db;
    this.attachment = new DbDocAttachment(this);
  }
  
  create (body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    this._performWriteAndInstantiateDoc(undefined, undefined, body, callback);
  }
  
  read (id: string, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performRead(id, (err, result) => {
      if (err) {
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err && err.name != "db_already_exists")
              callback(err);
            else
              this.read(id, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, new Doc(this.db, result)); // document found!
    });
  }
  
  private _performRead (id: string, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.get(id, Err.resultFunc('doc', callback));
  }
  
  write (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    this.head(id, (err, rev) => {
      if (err)
        callback(err);
      else {
        this._performWriteAndInstantiateDoc(id, rev, body, (err, doc) => {
          if (err) {
            if (tries <= this.db.maxTries && err.name == "conflict")
              this.write(id, body, callback, tries);
            else
              callback(err);
          }
          else
            callback(undefined, doc); // successfully written
        });
      }
    });
  }
  
  forcedWrite (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performWriteAndInstantiateDoc(id, undefined, body, (err, doc) => {
      if (err) {
        if (err.name == "conflict") {
          // document exists
          this.write(id, body, (err, doc) => {
            if (err) {
              if (tries <= this.db.maxTries && err.name == "not_found")
                this.forcedWrite(id, body, callback, tries);
              else
                callback(err);
            }
            else
              callback(undefined, doc); // successfully written
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, doc); // successfully written
    });
  }
  
  update (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    this.read(id, (err, doc) => {
      if (err)
        callback(err);
      else {
        // may as well call update on doc
        doc.update(body, (err) => {
          if (err)
            callback(err);
          else
            callback(undefined, doc); // successfully updated
        });
      }
    });
  }
  
  forcedUpdate (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performWriteAndInstantiateDoc(id, undefined, body, (err, doc) => {
      if (err) {
        if (err.name == "conflict") {
          // document exists
          this.update(id, body, (err, doc) => {
            if (err) {
              if (tries <= this.db.maxTries && err.name == "not_found")
                this.forcedUpdate(id, body, callback, tries);
              else
                callback(err);
            }
            else
              callback(undefined, doc); // successfully updated
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, doc); // successfully written
    });
  }
  
  private _performWriteAndInstantiateDoc (id: string, rev: string, body: { [index: string]: any }, callback: (err: Err, doc?: Doc)=>any, tries: number = 0)
  {
    tries++;
    this._performWrite(id, rev, body, (err, result) => {
      if (err) {
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err && err.name != "db_already_exists")
              callback(err);
            else
              this._performWriteAndInstantiateDoc(id, rev, body, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, new Doc(this.db, body, result)); // written successfully
    });
  }
  
  private _performWrite (id: string, rev: string, body: { [index: string]: any }, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.insert(deepExtend({}, body, { '_id': id, '_rev': undefined }), Err.resultFunc('doc', callback));
  }
  
  destroy (id: string, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    this.head(id, (err, rev) => {
      if (err) {
        if (err.name == "not_found")
          callback(); // nothing to see here
        else
          callback(err);
      }
      else
        this._performDestroy(id, rev, (err) => {
          if (err) {
            if (err.name == "not_found")
              callback(); // nothing to see here
            else if (tries <= this.db.maxTries && err.name == "conflict")
              this.destroy(id, callback, tries);
            else
              callback(err);
          }
          else
            callback(); // successfully destroyed
        });
    });
  }
  
  private _performDestroy (id: string, rev: string, callback: (err: Err)=>any)
  {
    this.db.raw.destroy(id, rev, Err.resultFunc('doc', callback));
  }
  
  head (id: string, callback: (err?: Err, rev?: string, result?: any)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performHead(id, (err, rev, result) => {
      if (err) {
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err && err.name != "db_already_exists")
              callback(err);
            else
              this.head(id, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, rev, result); // success
    });
  }
  
  private _performHead (id: string, callback: (err: Err, rev?: string, result?: any)=>any)
  {
    // here we need the third parameter
    // not the second
    // the second seems empty...
    this.db.raw.head(id, (raw: any, body: any, result: any) => {
      let err = Err.make('doc', raw);
      if (err)
        callback(err);
      else if (result['etag']) {
        // we have a new rev
        // nano puts it in the format '"etag"' so we need to
        // strip erroneous quotes
        callback(undefined, result['etag'].replace(/"/g, ""), result);
      }
      else
        callback(new Err('doc', "missing_rev", "Rev missing from header response."));
    });
  }
}
