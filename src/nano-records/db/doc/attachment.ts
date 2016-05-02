/* class DbDocAttachment
 * 
 * Acts as an entry point to this library's document attachment
 * interfaces. Expects a id to be specified on every operation
 * and generally doesn't return anything. It may be nice in the
 * future to return newly created Doc instances.
 * 
 * Most methods mirror those which are available on the
 * DocAttachment class.
 * 
 */

import {default as Err} from '../../err';
import {default as Doc} from '../../doc';
import {default as DbDoc} from '../doc';
import stream = require('stream');

export interface ErrCallback {
	(err?: Err): any;
}
export interface ErrDataCallback {
	(err?: Err, data?: any): any;
}

export default class DbDocAttachment
{
  doc: DbDoc;
  
  constructor (doc: DbDoc)
  {
    this.doc = doc;
  }
  
  read (id: string, name: string, callback: ErrDataCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('doc'));
    else
      this._performRead(id, name, callback);
  }
  
  private _performRead (id: string, name: string, callback: ErrDataCallback)
  {
    this.doc.db.raw.attachment.get(id, name, {}, Err.resultFunc('attachment', callback));
  }
  
  createReadStream (id: string, name: string, callback: ErrCallback = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      // return empty stream
      let readable = new stream.Readable();
      readable._read = ()=>{};
      readable.push(null);
      return readable;
    }
    else
      return this._performCreateReadStream(id, name, callback);
  }
  
  private _performCreateReadStream (id: string, name: string, callback: ErrCallback)
  {
    // TODO: truthfully this returns pretty ugly streams when there is an error
    // would be nice to clean up
    return this.doc.db.raw.attachment.get(id, name, {}, Err.resultFunc('attachment', callback));
  }
  
  write (id: string, name: string, data: any, mimeType: string, callback: ErrCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('doc'));
    else
      this._write(id, name, data, mimeType, callback);
  }
  
  private _write (id: string, name: string, data: any, mimeType: string, callback: ErrCallback, tries: number = 0)
  {
    tries++;
    this.doc.head(id, (err, rev) => {
      if (err)
        callback(err);
      else {
        this._performWrite(id, rev, name, data, mimeType, (err) => {
          if (err) {
            if (tries <= this.doc.db.maxTries && err.name == "conflict")
              this._write(id, name, data, mimeType, callback, tries);
            else
              callback(err);
          }
          else
            callback(); // successfully written
        });
      }
    });
  }
  
  private _performWrite (id: string, rev: string, name: string, data: any, mimeType: string, callback: ErrCallback)
  {
    this.doc.db.raw.attachment.insert(id, name, data, mimeType, { rev: rev }, Err.resultFunc('attachment', callback));
  }
  
  destroy (id: string, name: string, callback: ErrCallback = ()=>{})
  {
    if (!id)
      callback(Err.missingId('doc'));
    else
      this._destroy(id, name, callback);
  }
  
  private _destroy (id: string, name: string, callback: ErrCallback, tries: number = 0)
  {
    tries++;
    this.doc.head(id, (err, rev) => {
      if (err)
        callback(err);
      else {
        this._performDestroy(id, rev, name, (err) => {
          if (err) {
            if (tries <= this.doc.db.maxTries && err.name == "conflict")
              this._destroy(id, name, callback, tries);
            else
              callback(err);
          }
          else
            callback(); // successfully destroyed
        });
      }
    });
  }
  
  private _performDestroy (id: string, rev: string, name: string, callback: ErrCallback)
  {
    this.doc.db.raw.attachment.destroy(id, name, { rev: rev }, Err.resultFunc('attachment', callback));
  }
}
