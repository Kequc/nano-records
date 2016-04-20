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
      callback(Err.missing('doc'));
      return;
    }
    tries++;
    this._performWrite(name, data, mimeType, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.name == "conflict") {
          this.doc.retrieveLatest((err) => {
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
        this.doc.body['_rev'] = result['rev'];
        callback();
      }
    });
  }
  
  private _performWrite (name: string, data: any, mimeType: string, callback: (err: Err, result: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, (err: any, result: any) => {
      callback(Err.make('attachment', err), result);
    });
  }
  
  writer (name: string, mimetype: string, callback: (err?: Err)=>any = ()=>{})
  {
    if (!this.doc.getId()) {
      callback(Err.missing('doc'));
      return devNull();
    }
    return this._performWriter(name, null, mimetype, (err, result) => {
      if (err)
        callback(err);
      else {
        // attachment written
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        this.doc.body['_rev'] = result['rev'];
        callback();
      }
    });
  }
  
  private _performWriter (name: string, data: any, mimeType: string, callback: (err: Err, result: { [index: string]: string })=>any)
  {
    return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, (err: any, result: any) => {
      callback(Err.make('attachment', err), result);
    });
  }
  
  read (name: string, callback: (err?: Err, data?: any)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    this.doc.db.doc.attachment.read(this.doc.getId(), name, callback);
  }
  
  reader (name: string, callback: (err?: Err)=>any = ()=>{})
  {
    // we have a method already available for this on the db object
    return this.doc.db.doc.attachment.reader(this.doc.getId(), name, callback);
  }
  
  destroy (name: string, callback: (err?: Err)=>any = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(Err.missing('doc'));
      return;
    }
    tries++;
    this._performDestroy(name, (err, result) => {
      if (err) {
        if (tries <= this.doc.db.maxTries && err.name == "conflict") {
          this.doc.retrieveLatest((err) => {
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
        this.doc.body['_rev'] = result['rev'];
        callback();
      }
    });
  }
  
  private _performDestroy (name: string, callback: (err: Err, result: { [index: string]: string })=>any)
  {
    this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc.getRev() }, (err: any, result: any) => {
      callback(Err.make('attachment', err), result);
    });
  }
}
