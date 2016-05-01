/* class DocAttachment
 * 
 * Manages attachment operations on a single instance of a single
 * document in the database. Methods called within this class do
 * not take an `_id` parameter and in general will stop working if
 * the document no longer has one.
 * 
 * All methods assume that a database exists.
 * 
 */

import {default as Err} from '../err';
import {default as Doc} from '../doc';
import devNull = require('dev-null');

export default class DocAttachment
{
  doc: Doc;
  
  constructor (doc: Doc)
  {
    this.doc = doc;
  }
  
  read (name: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
  }
  
  createReadStream (name: string, callback: (err?: Err)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    return this.doc.db.doc.attachment.createReadStream(this.doc.getId(), name, callback);
  }
  
  write (name: string, data: any, mimeType: string, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performWrite(name, data, mimeType, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.name == "conflict") {
          this.doc.head((err) => {
            if (err)
              callback(err);
            else
              this.write(name, data, mimeType, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        // attachment written
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        // we are intentionally not storing the new rev on the document
        this.doc._latestRev = result['rev'];
        callback();
      }
    });
  }
  
  private _performWrite (name: string, data: any, mimeType: string, callback: (err: Err, result?: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc._latestRev }, Err.resultFunc('attachment', callback));
  }
  
  createWriteStream (name: string, mimeType: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return devNull();
    }
    return this._performCreateWriteStream(name, undefined, mimeType, (err, result) => {
      if (err)
        callback(err);
      else {
        // attachment written
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        // we are intentionally not storing the new rev on the document
        this.doc._latestRev = result['rev'];
        callback();
      }
    });
  }
  
  private _performCreateWriteStream (name: string, data: any, mimeType: string, callback: (err: Err, result?: { [index: string]: string })=>any)
  {
    return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc._latestRev }, Err.resultFunc('attachment', callback));
  }
  
  destroy (name: string, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    this._performDestroy(name, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.name == "conflict") {
          this.doc.head((err) => {
            if (err)
              callback(err);
            else
              this.destroy(name, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        // attachment removed
        if (this.doc.body['_attachments'])
          delete this.doc.body['_attachments'][name];
        // we are intentionally not storing the new rev of the document
        this.doc._latestRev = result['rev'];
        callback();
      }
    });
  }
  
  private _performDestroy (name: string, callback: (err: Err, result?: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc._latestRev }, Err.resultFunc('attachment', callback));
  }
  
  list (): string[]
  {
    let attachments: string[] = [];
    for (let name in (this.doc.body['_attachments'] || {})) {
      attachments.push(name);
    };
    return attachments;
  }
  
  exists (name: string): boolean
  {
    return !!(this.doc.body['_attachments'] && this.doc.body['_attachments'][name]);
  }
}
