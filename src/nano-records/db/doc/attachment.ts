import {iNanoError} from '../../db';
import {default as Doc} from '../../doc';
import {default as DbDoc} from '../doc';

export default class DbDocAttachment
{
  doc: DbDoc;
  
  constructor (doc: DbDoc)
  {
    this.doc = doc;
  }
  
  persist (id: string, name: string, data: any, mimeType: string, callback: (err: Error)=>any = ()=>{})
  {
    this.doc.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.attachment.persist(name, data, mimeType, callback); // attempt attachment
    });
  }
  
  get (id: string, name: string, callback: (err?: Error, data?: any)=>any = ()=>{})
  {
    // doesn't need _rev
    // so we can skip doc.get
    this._performGet(id, name, (err, data) => {
      // NOTE: This is probably unnecessarily verbose
      if (err)
        callback(err);
      else
        callback(null, data); // attachment found!
    });
  }
  
  read (id: string, name: string, callback: (err?: Error)=>any = ()=>{})
  {
    return this._performGet(id, name, function (err) {
      // NOTE: Yeah yeah this is maybe too verbose too
      // FIXME: This doesn't actually return an error if the document doesn't exist
      if (err)
        callback(err);
      else
        callback(null); // found it!
    });
  }
  
  private _performGet (id: string, name: string, callback: (err: iNanoError, data?: any)=>any)
  {
    return this.doc.db.raw.attachment.get(id, name, {}, callback);
  }
  
  erase (id: string, name: string, callback: (err: Error)=>any = ()=>{})
  {
    this.doc.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.attachment.erase(name, callback); // attempt erase
    });
  }
}
