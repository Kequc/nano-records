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
  
  write (id: string, name: string, data: any, mimeType: string, callback: (err?: Err)=>any = ()=>{})
  {
    this.doc.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.attachment.write(name, data, mimeType, callback); // attempt write
    });
  }
  
  read (id: string, name: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missing('doc'));
      return;
    }
    // doesn't need `_rev` so we can skip `doc.get`
    this._performRead(id, name, callback);
  }
  
  private _performRead (id: string, name: string, callback: (err: Err, data: any)=>any)
  {
    this.doc.db.raw.attachment.get(id, name, {}, (err: any, data: any) => {
      callback(Err.make('attachment', err), data);
    });
  }
  
  reader (id: string, name: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missing('doc'));
      // return empty stream
      let readable = new stream.Readable();
      readable._read = ()=>{};
      readable.push(null);
      return readable;
    }
    return this._performReader(id, name, callback);
  }
  
  private _performReader (id: string, name: string, callback: (err?: Err)=>any)
  {
    // TODO: truthfully this returns pretty ugly streams when there is an error
    // would be nice to clean this up
    return this.doc.db.raw.attachment.get(id, name, {}, (err: any) => {
      callback(Err.make('attachment', err));
    });
  }
  
  destroy (id: string, name: string, callback: (err?: Err)=>any = ()=>{})
  {
    this.doc.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.attachment.destroy(name, callback); // attempt destroy
    });
  }
}
