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

export interface ErrCallback {
	(err?: Err): any;
}
export interface ErrResultCallback {
	(err?: Err, result?: SimpleObject): any;
}
export interface ErrDataCallback {
	(err?: Err, data?: any): any;
}
export interface SimpleObject {
	[index: string]: any;
}

export default class DocAttachment
{
  doc: Doc;
  
  constructor (doc: Doc)
  {
    this.doc = doc;
  }
  
  read (name: string, callback: ErrDataCallback = ()=>{})
  {
    // we have a method already available for this on the db object
    this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
  }
  
  createReadStream (name: string, callback: ErrCallback = ()=>{})
  {
    // we have a method already available for this on the db object
    return this.doc.db.doc.attachment.createReadStream(this.doc.getId(), name, callback);
  }
  
  write (name: string, data: any, mimeType: string, callback: ErrCallback = ()=>{})
  {
    if (!this.doc.getId())
      callback(Err.missingId('doc'));
    else if (!name)
      callback(Err.missingParam('attachment', "name"));
    else if (!data)
      callback(Err.missingParam('attachment', "data"));
    else if (!mimeType)
      callback(Err.missingParam('attachment', "mimeType"));
    else
      this._write(name, data, mimeType, callback);
  }
  
  private _write (name: string, data: any, mimeType: string, callback: ErrCallback, tries: number = 0)
  {
    tries++;
    this._performWrite(name, data, mimeType, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.name == "conflict") {
          this.doc.head((err) => {
            if (err)
              callback(err);
            else
              this._write(name, data, mimeType, callback, tries);
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
  
  private _performWrite (name: string, data: any, mimeType: string, callback: ErrResultCallback)
  {
    this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc._latestRev }, Err.resultFunc('attachment', callback));
  }
  
  createWriteStream (name: string, mimeType: string, callback: ErrCallback = ()=>{})
  {
    if (!this.doc.getId()) {
      callback(Err.missingId('doc'));
      return devNull();
    }
    else if (!name) {
      callback(Err.missingParam('attachment', "name"));
      return devNull();
    }
    else if (!mimeType) {
      callback(Err.missingParam('attachment', "mimeType"));
      return devNull();
    }
    else {
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
  }
  
  private _performCreateWriteStream (name: string, data: any, mimeType: string, callback: ErrResultCallback)
  {
    return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc._latestRev }, Err.resultFunc('attachment', callback));
  }
  
  destroy (name: string, callback: ErrCallback = ()=>{})
  {
    if (!this.doc.getId())
      callback(Err.missingId('doc'));
    else if (!name)
      callback(Err.missingParam('attachment', "name"));
    else
      this._destroy(name, callback);
  }
  
  private _destroy (name: string, callback: ErrCallback, tries: number = 0)
  {
    tries++;
    this._performDestroy(name, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.name == "conflict") {
          this.doc.head((err) => {
            if (err)
              callback(err);
            else
              this._destroy(name, callback, tries);
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
  
  private _performDestroy (name: string, callback: ErrResultCallback)
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
