import {iNanoError} from '../db';
import {default as Doc} from '../doc';

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
  
  persist (name: string, data: any, mimeType: string, callback: (err?: Error)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performPersist(name, data, mimeType, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.statusCode == 409) {
          this.doc.retrieveLatest((err) => {
            if (err)
              callback(err);
            else
              this.persist(name, data, mimeType, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        // attachment persisted
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        this.doc.body['_rev'] = result['rev'];
        callback(null);
      }
    });
  }
  
  write (name: string, mimetype: string, callback: (err?: Error)=>any = ()=>{})
  {
    return this._performPersist(name, null, mimetype, (err, result) => {
      if (err)
        callback(err);
      else {
        // attachment persisted
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        this.doc.body['_rev'] = result['rev'];
        callback(null);
      }
    });
  }
  
  private _performPersist (name: string, data: any, mimeType: string, callback: (err: iNanoError, result: { [index: string]: string })=>any)
  {
    return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, callback);
  }
  
  get (name: string, callback: (err?: Error, data?: any)=>any = ()=>{})
  {
    if (!this.doc.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    // we have a method already available for this on the db object
    this.doc.db.doc.attachment.get(this.doc.getId(), name, callback);
  }
  
  read (name: string, callback: (err?: Error)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    return this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
  }
  
  erase (name: string, callback: (err?: Error)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performErase(name, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.statusCode == 409) {
          this.doc.retrieveLatest((err) => {
            if (err)
              callback(err);
            else
              this.erase(name, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        // attachment removed
        if (this.doc.body['_attachments'])
          delete this.doc.body['_attachments'][name];
        this.doc.body['_rev'] = result['rev'];
        callback(null);
      }
    });
  }
  
  private _performErase (name: string, callback: (err: iNanoError, result: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc.getRev() }, callback);
  }
}
