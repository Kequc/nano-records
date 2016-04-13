import {default as Doc} from '../../doc';
import {default as DbDoc} from '../doc';

export default class DbDocAttachment
{
  doc: DbDoc;
  
  constructor (doc: DbDoc)
  {
    this.doc = doc;
  }
  
  add (id: string, name: string, data: any, mimeType: string, callback: Function = ()=>{})
  {
    this.doc.get(id, function (err: Error, doc: Doc) {
      if (err)
        callback(err);
      else
        doc.attachment.add(name, data, mimeType, callback); // attempt attachment
    });
  }
  
  get (id: string, name: string, callback: Function = ()=>{})
  {
    this.doc.get(id, function (err: Error, doc: Doc) {
      if (err)
        callback(err);
      else
        doc.attachment.get(name, callback); // attempt attachment get
    });
  }
  
  destroy (id: string, name: string, callback: Function = ()=>{})
  {
    this.doc.get(id, function (err: Error, doc: Doc) {
      if (err)
        callback(err);
      else
        doc.attachment.destroy(name, callback); // attempt destroy
    });
  }
}
