import {default as Doc} from '../doc';

export default class DocAttachment
{
  doc: Doc;
  
  constructor (doc: Doc)
  {
    this.doc = doc;
  }
  
  get (name: string, callback: Function = ()=>{})
  {
    if (!this.doc.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performGet(name, (err: Error, result: any) => {
      // NOTE: This is probably unnecessarily verbose
      if (err)
        callback(err);
      else
        callback(null, result); // attachment found!
    });
  }
  
  private _performGet (name: string, callback: Function)
  {
    return this.doc.db.raw.attachment.get(this.doc.getId(), name, {}, callback);
  }
  
  add (name: string, data: any, mimeType: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performAdd(name, data, mimeType, (err: Error, result: { [index: string]: string }) => {
      if (err) {
        if (tries <= this.doc.db.maxTries) {
          this.doc.retrieveLatest((err: Error) => {
            if (err)
              callback(err);
            else
              this.add(name, data, mimeType, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        // attachment added
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        this.doc.body['_rev'] = result['rev'];
        callback(null);
      }
    });
  }
  
  stream (name: string, mimetype: string, callback: Function = ()=>{})
  {
    return this._performAdd(name, null, mimetype, (err: Error, result: { [index: string]: string }) => {
      if (err)
        callback(err);
      else {
        // attachment streamed
        // TODO: Is there more information available here?
        this.doc.body['_attachments'] = this.doc.body['_attachments'] || {};
        this.doc.body['_attachments'][name] = {};
        this.doc.body['_rev'] = result['rev'];
        callback(null);
      }
    });
  }
  
  private _performAdd (name: string, data: any, mimeType: string, callback: Function)
  {
    return this.doc.db.raw.attachment.insert(this.doc.getId(), name, data, mimeType, { rev: this.doc.getRev() }, callback);
  }
  
  destroy (name: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.doc.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performDestroy(name, (err: Error, result: { [index: string]: string }) => {
      if (err) {
        if (tries <= this.doc.db.maxTries) {
          this.doc.retrieveLatest((err: Error) => {
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
        callback(null);
      }
    });
  }
  
  private _performDestroy (name: string, callback: Function)
  {
    return this.doc.db.raw.attachment.destroy(this.doc.getId(), name, { rev: this.doc.getRev() }, callback);
  }
}
