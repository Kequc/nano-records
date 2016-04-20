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
  
  persist (id: string, name: string, data: any, mimeType: string, callback: (err?: Err)=>any = ()=>{})
  {
    this.doc.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.attachment.persist(name, data, mimeType, callback); // attempt attachment
    });
  }
  
  get (id: string, name: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missing('doc'));
      return;
    }
    // doesn't need `_rev` so we can skip `doc.get`
    this._performGet(id, name, callback);
  }
  
  private _performGet (id: string, name: string, callback: (err: Err, data: any)=>any)
  {
    // TODO: truthfully this returns pretty ugly streams when there is an error
    // would be nice to clean this up
    this.doc.db.raw.attachment.get(id, name, {}, (err: any, data: any) => {
      callback(Err.make('attachment', err), data);
    });
  }
  
  read (id: string, name: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!id) {
      callback(Err.missing('doc'));
      // return empty stream
      let readable = new stream.Readable();
      readable._read = ()=>{};
      readable.push(null);
      return readable;
    }
    return this._performRead(id, name, callback);
  }
  
  private _performRead (id: string, name: string, callback: (err?: Err)=>any)
  {
    return this.doc.db.raw.attachment.get(id, name, {}, (err: any) => {
      callback(Err.make('attachment', err));
    });
  }
  
  erase (id: string, name: string, callback: (err?: Err)=>any = ()=>{})
  {
    this.doc.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.attachment.erase(name, callback); // attempt erase
    });
  }
}
