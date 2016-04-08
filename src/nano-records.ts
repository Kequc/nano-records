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
    if (!this.getId()) {
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
    return this._parent.db.attachment.get(this.getId(), name, {}, callback);
  }
  
  attachmentAdd (name: string, data: any, mimeType: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
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
        callback(null); // attachment added
    }.bind(this));
  }
  
  attachmentStream (name: string, mimetype: string, callback: Function = ()=>{})
  {
    return this._performAttachmentAdd(name, null, mimetype, function (err: Error) {
      if (err)
        callback(err);
      else
        callback(null); // attachment streamed
    });
  }
  
  private _performAttachmentAdd (name: string, data: any, mimeType: string, callback: Function)
  {
    return this._parent.db.attachment.insert(this.getId(), name, data, mimeType, { rev: this.getRev() }, callback);
  }
  
  attachmentDestroy (name: string, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
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
        callback(null); // attachment removed
    }.bind(this));
  }
  
  private _performAttachmentDestroy (name: string, callback: Function)
  {
    return this._parent.db.attachment.destroy(this.getId(), name, { rev: this.getRev() }, callback);
  }
  
  getId (): string
  {
    return this.body['_id'] || null;
  }
  
  getRev (): string
  {
    return this.body['_rev'] || null;
  }
  
  hasAttachment(name: string): boolean
  {
    return !!(this.body['_attachments'] && this.body['_attachments'][name]);
  }
  
  retrieveLatest (callback: Function = ()=>{})
  {
    if (!this.getId()) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._performRetrieveLatest(function (err: Error, result: Object) {
      if (err)
        callback(err);
      else {
        this.body = result;
        callback(null); // up to date
      }
    }.bind(this));
  }
  
  private _performRetrieveLatest (callback: Function)
  {
    return this._parent.db.get(this.getId(), callback);
  }
  
  update (body: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.getId()) {
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
        callback(null); // success
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
    if (!this.getId()) {
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
        callback(null); // success
      }
    }.bind(this));
  }
  
  private _performDestroy (callback: Function)
  {
    return this._parent.db.destroy(this.getId(), this.getRev(), callback);
  }
}

interface iDesignInput {
  language?: string,
  shows?: { [index: string]: string };
  views?: { [index: string]: { map: string, reduce: string }};
}

class NanoRecords
{
  nano: any;
  dbName: string;
  designs: { [index: string]: iDesignInput };
  db: any;
  
  constructor (nano: any, dbName: string, designs?: { [index: string]: iDesignInput })
  {
    this.nano = nano;
    this.dbName = dbName;
    this.designs = {};
    for (let key in designs) {
      let design = designs[key] || {};
      this.designs[key] = {
        language: design.language || "javascript",
        shows: design.shows || {},
        views: design.views || {}
      };
    }
    this.db = this.nano.use(this.dbName);
  }
  
  doc = {
    create: this.docCreate.bind(this),
    get: this.docGet.bind(this),
    update: this.docUpdate.bind(this),
    updateOrCreate: this.docUpdateOrCreate.bind(this),
    destroy: this.docDestroy.bind(this),
    design: {
      show: this.designShow.bind(this),
      view: this.designView.bind(this)
    },
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
  
  docUpdateOrCreate (id: string, body: Object, callback: Function = ()=>{})
  {
    this.docGet(id, function (err: Error, doc: NanoRecords_Document) {
      if (err) {
        body['_id'] = id;
        this.docCreate(body, callback); // attempt create
      }
      else
        doc.update(body, callback); // attempt update
    }.bind(this));
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
  
  designShow (id: string, name: string, params: any, callback: Function = ()=>{}, tries: number = 0)
  {
    // TODO
  }
  
  designView (id: string, name: string, params: any, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.view(id, name, params, function (err, result) {
      if (err) {
        if (tries <= 1 && (['missing', 'deleted', 'missing_named_view'].indexOf(err.message) > -1)) {
          let design = this.designs[id];
          if (!design)
            callback(new Error("No design specified for: " + id));
          else {
            // setup design document changes
            let body = { views: {} };
            body['views'][name] = design.views[name];
            if (design.language)
              body['language'] = design.language;
            this.docUpdateOrCreate('_design/' + id, body, function (err) {
              if (err)
                callback(err);
              else
                this.designView(id, name, params, callback, tries);
            }.bind(this));
          }
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
