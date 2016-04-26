/* class DbDoc
 * 
 * Acts as an entry point to this library's document interfaces.
 * Expects a id to be specified on every operation and generally
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
  
  create (body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    this._performWriteAndInstantiateDoc(undefined, body, (err, doc) => {
      if (err) {
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err)
              callback(err);
            else
              this.create(body, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(undefined, doc); // created successfully
    });
  }
  
  read (id: string, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    tries++;
    this._performRead(id, (err, result) => {
      if (err)
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err)
              callback(err);
            else
              this.read(id, callback, tries);
          });
        }
        else
          callback(err);
      else
        callback(undefined, new Doc(this.db, result)); // document found!
    });
  }
  
  private _performRead (id: string, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.get(id, Err.resultFunc('doc', callback));
  }
  
  write (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    // TODO: this can probably be done with only a head request to get
    // the latest rev
    this.read(id, (err, doc) => {
      if (err) {
        if (err.name == "not_found")
          this._performWriteAndInstantiateDoc(id, body, callback); // we'll do it live!
        else
          callback(err);
      }
      else {
        // attempt write
        doc.write(body, (err) => {
          if (err)
            callback(err);
          else
            callback(undefined, doc);
        });
      }
    });
  }
  
  update (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this.read(id, (err, doc) => {
      if (err) {
        if (err.name == "not_found")
          this._performWriteAndInstantiateDoc(id, body, callback); // we'll do it live!
        else
          callback(err);
      }
      else {
        // attempt update
        doc.update(body, (err) => {
          if (err)
            callback(err);
          else
            callback(undefined, doc); // successfully updated
        });
      }
    });
  }
  
  private _performWriteAndInstantiateDoc (id: string, body: { [index: string]: any }, callback: (err: Err, doc?: Doc)=>any)
  {
    this._performWrite(id, body, (err, result) => {
      if (err)
        callback(err, undefined);
      else
        callback(undefined, new Doc(this.db, body, result)); // written successfully
    });
  }
  
  private _performWrite (id: string, body: { [index: string]: any }, callback: (err: Err, result?: { [index: string]: any })=>any)
  {
    this.db.raw.insert(deepExtend({}, body, { '_id': id, '_rev': undefined }), Err.resultFunc('doc', callback));
  }
  
  destroy (id: string, callback: (err?: Err)=>any = ()=>{})
  {
    // TODO: this can probably be done with only a head request to get
    // the latest rev
    this.read(id, (err, doc) => {
      if (err) {
        if (err.name == "not_found")
          callback(); // nothing to see here
        else
          callback(err);
      }
      else
        doc.destroy(callback); // attempt destroy
    });
  }
  
  head (id: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performHead(id, callback);
  }
  
  private _performHead (id: string, callback: (err: Err, result?: any)=>any)
  {
    // here we need the third parameter
    // not the second
    this.db.raw.head(id, (raw: any, body: any, result: any) => {
      let err = Err.make('doc', raw);
      if (err)
        callback(err);
      else
        callback(undefined, result);
    });
  }
}
