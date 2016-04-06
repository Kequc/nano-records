/// <reference path="../typings/main.d.ts" />

var deepExtend = require('deep-extend');
var maxTries: number = 5;

class NanoRecords_Document
{
  private _parent: NanoRecords;
  data: Object;
  
  constructor (parent: NanoRecords, data: Object = {})
  {
    this._parent = parent;
    this.data = data;
  }
  
  attachment = {
    find: this.attachmentFind.bind(this),
    add: this.attachmentAdd.bind(this),
    stream: this.attachmentStream.bind(this),
    destroy: this.attachmentDestroy.bind(this)
  };
  
  attachmentFind (name: string, callback: Function = ()=>{})
  {
    if (!this.data['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performAttachmentFind(name, function (err: Error, body: any) {
      // NOTE: This is probably unnecessarily verbose
      if (err)
        callback(err);
      else
        callback(null, body); // attachment found!
    });
  }
  
  private _performAttachmentFind (name: string, callback: Function)
  {
    return this._parent.db.attachment.get(this.data['_id'], name, {}, callback);
  }
  
  attachmentAdd (name: string, data: any, mimeType: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.data['_id']) {
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
    return this._parent.db.attachment.insert(this.data['_id'], name, data, mimeType, { rev: this.data['_rev'] }, callback);
  }
  
  attachmentDestroy (name: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.data['_id']) {
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
    return this._parent.db.attachment.destroy(this.data['_id'], name, { rev: this.data['_rev'] }, callback);
  }
  
  retrieveLatest (callback: Function = ()=>{})
  {
    if (!this.data['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performRetrieveLatest(function (err: Error, body: Object) {
      if (err)
        callback(err);
      else {
        this.data = body;
        callback(null, true); // up to date
      }
    }.bind(this));
  }
  
  private _performRetrieveLatest (callback: Function)
  {
    return this._parent.db.get(this.data['_id'], callback);
  }
  
  update (data: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.data['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this._performUpdate(data, function (err: Error, body: Object) {
      if (err) {
        if (tries <= maxTries) {
          this.retrieveLatest(function (err: Error) {
            if (err)
              callback(err);
            else
              this.update(data, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else {
        this.data = this._extendData(data);
        this.data['_rev'] = body['rev'];
        callback(null, true); // success
      }
    }.bind(this));
  }
  
  private _performUpdate (data: Object, callback: Function)
  {
    return this._parent.db.insert(this._extendData(data), callback);
  }
  
  private _extendData(data: Object): Object
  {
    return deepExtend({}, this.data, data);
  }
  
  destroy (callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.data['_id']) {
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
        this.data = {};
        callback(null, true); // success
      }
    }.bind(this));
  }
  
  private _performDestroy (callback: Function)
  {
    return this._parent.db.destroy(this.data['_id'], this.data['_rev'], callback);
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
    find: this.docFind.bind(this),
    update: this.docUpdate.bind(this),
    destroy: this.docDestroy.bind(this)
  };
  
  docCreate (data: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.insert(data, function (err: Error, body: Object) {
      if (err) {
        if (tries <= 1 && err.message === 'no_db_file') {
          // create db
          this.nano.db.create(this.dbName, function (err: Error) {
            if (err)
              callback(err);
            else
              this.docCreate(data, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else {
        data['_id'] = body['id'];
        data['_rev'] = body['rev'];
        callback(null, new NanoRecords_Document(this, data)); // created successfully
      }
    }.bind(this));
  }
  
  docFind (id: string, callback: Function = ()=>{})
  {
    this.db.get(id, function (err: Error, body: Object) {
      if (err)
        callback(err);
      else
        callback(null, new NanoRecords_Document(this, body)); // document found!
    }.bind(this));
  }
  
  docUpdate (id: string, data: Object, callback: Function = ()=>{})
  {
    this.docFind(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.update(data, callback); // attempt update
    });
  }
  
  docDestroy (id: string, callback: Function = ()=>{})
  {
    this.docFind(id, function (err: Error, doc: NanoRecords_Document) {
      if (err)
        callback(err);
      else
        doc.destroy(callback); // attempt destroy
    });
  }
  
  view (name: string, data: any, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.view(this.dbName, name, data, function (err, body) {
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
                this.view(name, data, callback, tries);
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
                this.view(name, data, callback, tries);
            }.bind(this));
          }
          else
            callback(err);
        }
        else
          callback(err);
      }
      else
        callback(null, body); // executed successfully
    }.bind(this));
  }
}

module.exports = NanoRecords;
