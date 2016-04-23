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
  
  write (name: string, data: any, mimeType: string, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    tries++;
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
        // we are intentionally not storing the new rev of the document
        this.doc._latestRev = result['rev'];
        callback();
      }
    });
  }
  
  private _performWrite (name: string, data: any, mimeType: string, callback: (err: Err, result?: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc._latestRev }, Err.resultFunc('attachment', callback));
  }
  
  read (name: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
  }
  
  readStream (name: string, callback: (err?: Err)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    return this.doc.db.doc.attachment.readStream(this.doc.getId(), name, callback);
  }
  
  writeStream (name: string, mimetype: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return devNull();
    }
    return this._performWriteStream(name, null, mimetype, (err, result) => {
      if (err)
        callback(err);
      else {
        // attachment written
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        // we are intentionally not storing the new rev of the document
        this.doc._latestRev = result['rev'];
        callback();
      }
    });
  }
  
  private _performWriteStream (name: string, data: any, mimeType: string, callback: (err: Err, result?: { [index: string]: string })=>any)
  {
    if (this.doc.getRev() !== this.doc._latestRev) {
      callback(Err.conflict('doc'));
      return devNull();
    }
    else
      return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, Err.resultFunc('attachment', callback));
  }
  
  destroy (name: string, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return;
    }
    tries++;
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
}
