import {default as Db} from '../db';
import {default as Doc} from '../doc';
import {default as DbDocAttachment} from './doc/attachment';

export default class DbDoc
{
  db: Db;
  attachment: DbDocAttachment;
  
  constructor (db: Db)
  {
    this.db = db;
    this.attachment = new DbDocAttachment(this);
  }
  
  create (body: { [index: string]: any }, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.raw.insert(body, function (err: Error, result: { [index: string]: any }) {
      if (err) {
        if (tries <= 1 && err.message === 'no_db_file') {
          // create db
          this.db.nano.db.create(this.db.dbName, function (err: Error) {
            if (err)
              callback(err);
            else
              this.create(body, callback, tries);
          }.bind(this));
        }
        else
          callback(err);
      }
      else {
        body['_id'] = result['id'];
        body['_rev'] = result['rev'];
        callback(null, new Doc(this.db, body)); // created successfully
      }
    }.bind(this));
  }
  
  get (id: string, callback: Function = ()=>{})
  {
    this.db.raw.get(id, function (err: Error, result: Object) {
      if (err)
        callback(err);
      else
        callback(null, new Doc(this.db, result)); // document found!
    }.bind(this));
  }
  
  update (id: string, body: { [index: string]: any }, callback: Function = ()=>{})
  {
    this.get(id, function (err: Error, doc: Doc) {
      if (err)
        callback(err);
      else
        doc.update(body, callback); // attempt update
    });
  }
  
  updateOrCreate (id: string, body: { [index: string]: any }, callback: Function = ()=>{})
  {
    this.get(id, function (err: Error, doc: Doc) {
      if (err) {
        body['_id'] = id;
        this.create(body, callback); // attempt create
      }
      else
        doc.update(body, function (err: Error) {
          if (err)
            callback(err);
          else
            callback(null, doc);
        }); // attempt update
    }.bind(this));
  }
  
  destroy (id: string, callback: Function = ()=>{})
  {
    this.get(id, function (err: Error, doc: Doc) {
      if (err)
        callback(err);
      else
        doc.destroy(callback); // attempt destroy
    });
  }
}
