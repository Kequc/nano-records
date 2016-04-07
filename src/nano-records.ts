/// <reference path="../typings/main.d.ts" />

var deepExtend = require('deep-extend');
var maxTries: number = 5;

class NanoRecords_Document
{
  private _parent: NanoRecords;
  body: Object;
  
  constructor (parent: NanoRecords, body: Object = {})
  {
    this._parent = parent;
    this.body = body;
  }
  
  attachment = {
    get: this.attachmentGet.bind(this),
    add: this.attachmentAdd.bind(this),
    stream: this.attachmentStream.bind(this),
    destroy: this.attachmentDestroy.bind(this)
  };
  
  attachmentGet (name: string, callback: Function = ()=>{})
  {
    if (!this.body['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performAttachmentGet(name, function (err: Error, result: any) {
      // NOTE: This is probably unnecessarily verbose
      if (err)
        callback(err);
      else
        callback(null, result); // attachment found!
    });
  }
  
  private _performAttachmentGet (name: string, callback: Function)
  {
    return this._parent.db.attachment.get(this.body['_id'], name, {}, callback);
  }
  
  attachmentAdd (name: string, data: any, mimeType: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.body['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performAttachmentAdd(name, data, mimeType, function (err: Error) {
      if (err) {
        if (tries <= maxTries) {
          this.retrieveLatest(function (err: Error) {
            if (err)
              callback(err);
            else
              this.attachmentAdd(name, data, mimeType, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else
        callback(null, true); // attachment added
    }.bind(this));
  }
  
  attachmentStream (name: string, mimetype: string, callback: Function = ()=>{})
  {
    return this._performAttachmentAdd(name, null, mimetype, function (err: Error) {
      if (err)
        callback(err);
      else
        callback(null, true); // attachment streamed
    });
  }
  
  private _performAttachmentAdd (name: string, data: any, mimeType: string, callback: Function)
  {
    return this._parent.db.attachment.insert(this.body['_id'], name, data, mimeType, { rev: this.body['_rev'] }, callback);
  }
  
  attachmentDestroy (name: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.body['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performAttachmentDestroy(name, function (err: Error) {
      if (err) {
        if (tries <= maxTries) {
          this.retrieveLatest(function (err: Error) {
            if (err)
              callback(err);
            else
              this.attachmentDestroy(name, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else
        callback(null, true); // attachment removed
    }.bind(this));
  }
  
  private _performAttachmentDestroy (name: string, callback: Function)
  {
    return this._parent.db.attachment.destroy(this.body['_id'], name, { rev: this.body['_rev'] }, callback);
  }
  
  retrieveLatest (callback: Function = ()=>{})
  {
    if (!this.body['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performRetrieveLatest(function (err: Error, result: Object) {
      if (err)
        callback(err);
      else {
        this.body = result;
        callback(null, true); // up to date
      }
    }.bind(this));
  }
  
  private _performRetrieveLatest (callback: Function)
  {
    return this._parent.db.get(this.body['_id'], callback);
  }
  
  update (body: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.body['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performUpdate(body, function (err: Error, result: Object) {
      if (err) {
        if (tries <= maxTries) {
          this.retrieveLatest(function (err: Error) {
            if (err)
              callback(err);
            else
              this.update(body, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else {
        this.body = this._extendData(body);
        this.body['_rev'] = result['rev'];
        callback(null, true); // success
      }
    }.bind(this));
  }
  
  private _performUpdate (body: Object, callback: Function)
  {
    return this._parent.db.insert(this._extendData(body), callback);
  }
  
  private _extendData(body: Object): Object
  {
    return deepExtend({}, this.body, body);
  }
  
  destroy (callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.body['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performDestroy(function (err: Error) {
      if (err) {
        if (tries <= maxTries) {
          this.retrieveLatest(function (err: Error) {
            if (err)
              callback(err);
            else
              this.destroy(callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else {
        this.body = {};
        callback(null, true); // success
      }
    }.bind(this));
  }
  
  private _performDestroy (callback: Function)
  {
    return this._parent.db.destroy(this.body['_id'], this.body['_rev'], callback);
  }
}

class NanoRecords
{
  nano: any;
  dbName: string;
  views: Object;
  db: any;
  
  constructor (nano: any, dbName: string, views?: Object)
  {
    this.nano = nano;
    this.dbName = dbName;
    this.views = views || {};
    this.db = this.nano.use(this.dbName);
  }
  
  doc = {
    create: this.docCreate.bind(this),
    get: this.docGet.bind(this),
    update: this.docUpdate.bind(this),
    destroy: this.docDestroy.bind(this),
    attachment: {
      add: this.docAttachmentAdd.bind(this),
      get: this.docAttachmentGet.bind(this),
      destroy: this.docAttachmentDestroy.bind(this),
    }
  };
  
  docAttachmentAdd (id: string, name: string, data: any, mimeType: string, callback: Function = ()=>{})
  {
    this.docGet(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.attachmentAdd(name, data, mimeType, callback); // attempt attachment
    });
  }
  
  docAttachmentGet (id: string, name: string, callback: Function = ()=>{})
  {
    this.docGet(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.attachmentGet(name, callback); // attempt get
    });
  }
  
  docAttachmentDestroy (id: string, name: string, callback: Function = ()=>{})
  {
    this.docGet(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.attachmentDestroy(name, callback); // attempt destroy
    });
  }
  
  docCreate (body: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.insert(body, function (err: Error, result: Object) {
      if (err) {
        if (tries <= 1 && err.message === 'no_db_file') {
          // create db
          this.nano.db.create(this.dbName, function (err: Error) {
            if (err)
              callback(err);
            else
              this.docCreate(body, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else {
        body['_id'] = result['id'];
        body['_rev'] = result['rev'];
        callback(null, new NanoRecords_Document(this, body)); // created successfully
      }
    }.bind(this));
  }
  
  docGet (id: string, callback: Function = ()=>{})
  {
    this.db.get(id, function (err: Error, result: Object) {
      if (err)
        callback(err);
      else
        callback(null, new NanoRecords_Document(this, result)); // document found!
    }.bind(this));
  }
  
  docUpdate (id: string, body: Object, callback: Function = ()=>{})
  {
    this.docGet(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.update(body, callback); // attempt update
    });
  }
  
  docDestroy (id: string, callback: Function = ()=>{})
  {
    this.docGet(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.destroy(callback); // attempt destroy
    });
  }
  
  view (name: string, params: any, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.view(this.dbName, name, params, function (err, result) {
      if (err) {
        if (tries <= 1) {
          if (err.message === 'missing' || err.message === 'deleted') {
            // create design document
            let designData = { _id: '_design/' + this.dbName, views: {} };
            designData.views[name] = this.views[name];
            this.docCreate(designData, function (err) {
              if (err)
                callback(err);
              else
                this.view(name, params, callback, tries);
            }.bind(this));
          }
          else if (err.message === 'missing_named_view') {
            // add view
            let viewData = {};
            viewData[name] = this.views[name];
            this.docUpdate('_design/' + this.dbName, { views: viewData }, function (err: Error) {
              if (err)
                callback(err);
              else
                this.view(name, params, callback, tries);
            }.bind(this));
          }
          else
            callback(err);
        }
        else
          callback(err);
      }
      else
        callback(null, result); // executed successfully
    }.bind(this));
  }
}

module.exports = NanoRecords;
