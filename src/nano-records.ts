declare var require: any;
var _ = require('lodash');

class NanoRecord
{
  private _parent: NanoRecords;
  data: Object;
  
  constructor (parent: NanoRecords, data: Object = {})
  {
    this._parent = parent;
    this.data = data;
  }
  
  attachmentGet (name: string, callback: Function = ()=>{})
  {
    this._parent.db.attachment.get(this.data['_id'], name, {}, function (err: Error, body: any) {
      if (err)
        callback(err);
      else
        callback(null, body);
    });
  }
  
  attachmentAdd (name: string, data: any, mimeType: string, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    let next = function () {
      this._parent.db.attachment.insert(this.data['_id'], name, data, mimeType, { rev: this.data['_rev'] }, function (err: Error, body: any) {
        if (err) {
          if (tries <= 3)
            this.attach(name, data, mimeType, callback, tries);
          else
            callback(err);
        }
        else
          callback(null, this);
      }.bind(this));
    };
    if (data || data == 0) {
      // not an attempt to stream
      this.fetch(function (err) {
        if (err)
          callback(err);
        else
          next();
      });
    }
    else
      return next();
  }
  
  attachmentRemove (name: string, callback: Function = ()=>{})
  {
    this.fetch(function (err) {
      if (err)
        callback(err);
      else {
        this._parent.db.attachment.destroy(this.data['_id'], name, { rev: this.data['_rev'] }, function (err: Error) {
          if (err)
            callback(err);
          else
            callback(null, this);
        });
      }
    }.bind(this));
  }
  
  fetch (callback: Function = ()=>{})
  {
    if (!this.data['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    this._parent.db.get(this.data['_id'], function (err: Error, body: Object) {
      if (err)
        callback(err);
      else {
        this.data = body;
        callback(null, this);
      }
    }.bind(this));
  }
  
  update (data: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.data['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this.fetch(function (err) {
      if (err)
        callback(err);
      else {
        let newData = _.extend({}, this.data, data);
        this._parent.db.insert(newData, function (err, body) {
          if (err) {
            if (tries <= 3)
              this.update(data, callback, tries);
            else
              callback(err);
          }
          else
            callback(null, this);
        }.bind(this));
      }
    }.bind(this));
  }
  
  destroy (callback: Function = ()=>{}, tries: number = 0)
  {
    if (!this.data['_id']) {
      callback(new Error('Document does not exist.'));
      return;
    }
    tries++;
    this.fetch(function (err) {
      if (err)
        callback(err);
      else {
        this._parent.db.destroy(this.data['_id'], this.data['_rev'], function (err) {
          if (err)
            callback(err);
          else {
            this.data = {};
            callback();
          }
        }.bind(this));
      }
    }.bind(this));
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
  
  create (data: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.insert(data, function (err: Error, body: Object) {
      if (err) {
        if (tries <= 3 && err.message === 'no_db_file') {
          // create db
          this.nano.db.create(this.dbName, function () {
            this.create(data, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else
        callback(null, new NanoRecord(this, body));
    }.bind(this));
  }
  
  update (id: string, data: Object, callback: Function = ()=>{})
  {
    this.find(id, function (err: Error, instance: NanoRecord) {
      if (err)
        callback(err);
      else
        instance.update(data, callback);
    });
  }
  
  find (id: string, callback: Function = ()=>{})
  {
    this.db.get(id, function (err: Error, body: Object) {
      if (err)
        callback(err);
      else
        callback(null, new NanoRecord(this, body));
    }.bind(this));
  }
  
  view (name: string, data: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.view(this.dbName, name, data, function (err, body) {
      if (err) {
        if (tries <= 4) {
          if (err.message === 'missing' || err.message === 'deleted') {
            // create design document
            let designDoc = { _id: '_design/' + this.dbName, views: {} };
            designDoc.views[name] = this._views[name];
            this.create(designDoc, function (err) {
              if (err)
                callback(err);
              else
                this.view(name, data, callback, tries);
            }.bind(this));
          }
          else if (err.message === 'missing_named_view') {
            // add view to design document
            let views = {};
            views[name] = this._views[name];
            this.update('_design/' + this.dbName, { views: views }, function (err) {
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
        callback(null, body);
    }.bind(this));
  }
}

declare var module: any;
module.exports = NanoRecords;
