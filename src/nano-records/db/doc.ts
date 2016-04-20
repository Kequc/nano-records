import {default as Err} from '../err';
import {default as Db} from '../db';
import {default as Doc} from '../doc';
import {default as DbDocAttachment} from './doc/attachment';
import deepExtend = require('deep-extend');

export default class DbDoc
{
  db: Db;
  attachment: DbDocAttachment;
  
  constructor (db: Db)
  {
    this.db = db;
    this.attachment = new DbDocAttachment(this);
  }
  
  create (body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    tries++;
    this._performCreate(body, (err, result) => {
      if (err) {
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err)
              callback(err);
            else
              this.create(body, callback, tries);
          });
        }
        else
          callback(err);
      }
      else {
        let doc = new Doc(this.db, body); 
        doc.body['_id'] = result['id'];
        doc.body['_rev'] = result['rev'];
        callback(undefined, doc); // created successfully
      }
    });
  }
  
  private _performCreate (body: { [index: string]: any }, callback: (err: Err, result: { [index: string]: any })=>any)
  {
    this.db.raw.insert(body, (err: any, result: any) => {
      callback(Err.make('doc', err), result);
    });
  }
  
  get (id: string, callback: (err?: Err, doc?: Doc)=>any = ()=>{}, tries: number = 0)
  {
    if (!id) {
      callback(Err.missing('doc'));
      return;
    }
    tries++;
    this._performGet(id, (err, result) => {
      if (err)
        if (tries <= 1 && err.name == "no_db_file") {
          // create db
          this.db.create((err) => {
            if (err)
              callback(err);
            else
              this.get(id, callback, tries);
          });
        }
        else
          callback(err);
      else
        callback(undefined, new Doc(this.db, result)); // document found!
    });
  }
  
  private _performGet (id: string, callback: (err: Err, result: { [index: string]: any })=>any)
  {
    this.db.raw.get(id, (err: any, result: any) => {
      callback(Err.make('doc', err), result);
    });
  }
  
  overwrite (id: string, body: { [index: string]: any }, callback: (err?: Err)=>any = ()=>{})
  {
    this.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.overwrite(body, callback); // attempt overwrite
    });
  }
  
  update (id: string, body: { [index: string]: any }, callback: (err?: Err)=>any = ()=>{})
  {
    this.get(id, (err, doc) => {
      if (err)
        callback(err);
      else
        doc.update(body, callback); // attempt update
    });
  }
  
  updateOrCreate (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    this.get(id, (err, doc) => {
      if (err)
        this.create(deepExtend({}, body, { '_id': id }), callback); // attempt create
      else {
        doc.update(body, (err) => {
          if (err)
            callback(err);
          else
            callback(undefined, doc);
        }); // attempt update
      }
    });
  }
  
  overwriteOrCreate (id: string, body: { [index: string]: any }, callback: (err?: Err, doc?: Doc)=>any = ()=>{})
  {
    this.get(id, (err, doc) => {
      if (err)
        this.create(deepExtend({}, body, { '_id': id }), callback); // attempt create
      else {
        doc.overwrite(body, (err) => {
          if (err)
            callback(err);
          else
            callback(undefined, doc);
        }); // attempt overwrite
      }
    });
  }
  
  destroy (id: string, callback: (err?: Err)=>any = ()=>{})
  {
    this.get(id, (err, doc) => {
      if (err) {
        if (err.name == "not_found")
          callback(); // nothing to see here
        else
          callback(err);
      }
      else
        doc.destroy(callback); // attempt destroy
    });
  }
}
