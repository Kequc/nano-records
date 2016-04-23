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

export default class DbDocAttachment
{
  doc: DbDoc;
  
  constructor (doc: DbDoc)
  {
    this.doc = doc;
  }
  
  write (id: string, name: string, data: any, mimeType: string, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    // TODO: this is also inefficient since we might attempt to
    // write the attachment first without looking up the document
    // if the document doesn't exist the operation would be
    // successful
    this.doc.read(id, (err, doc) => {
      if (err) {
        if (err.name == "not_found")
          // we'll do it live!
          this._performWrite(id, name, data, mimeType, (err, result) => {
            if (err)
              callback(err);
            else {
              let doc = new Doc(this.doc.db, {}, result);
              doc.body['_attachments'] = {};
              doc.body['_attachments'][name] = {};
              callback(undefined, doc);
            }
          });
        else
          callback(err);
      }
      else {
        // attempt write
        doc.attachment.write(name, data, mimeType, (err) => {
          if (err)
            callback(err);
          else
            callback(undefined, doc); // success
        });
      }
    });
  }
  
  private _performWrite (id: string, name: string, data: any, mimeType: string, callback: (err: Err, result?: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.insert(id, name, data, mimeType, {}, Err.resultFunc('attachment', callback));
  }
  
  read (id: string, name: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    // doesn't need `_rev` so we can skip `doc.get`
    this._performRead(id, name, callback);
  }
  
  private _performRead (id: string, name: string, callback: (err: Err, data?: any)=>any)
  {
    this.doc.db.raw.attachment.get(id, name, {}, Err.resultFunc('attachment', callback));
  }
  
  readStream (id: string, name: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      // return empty stream
      let readable = new stream.Readable();
      readable._read = ()=>{};
      readable.push(null);
      return readable;
    }
    return this._performReadStream(id, name, callback);
  }
  
  private _performReadStream (id: string, name: string, callback: (err?: Err)=>any)
  {
    // TODO: truthfully this returns pretty ugly streams when there is an error
    // would be nice to clean this up
    return this.doc.db.raw.attachment.get(id, name, {}, Err.resultFunc('attachment', callback));
  }
  
  destroy (id: string, name: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missingId('doc'));
      return;
    }
    // TODO: this is inefficiant and could probably be done with only
    // a head request probably
    this.doc.read(id, (err, doc) => {
      if (err)
        if (err.name == "not_found")
          callback(); // nothing to see here
        else
          callback(err);
      else
        doc.attachment.destroy(name, callback); // attempt destroy
    });
  }
}
