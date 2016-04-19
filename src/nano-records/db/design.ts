import {default as Err} from '../err';
import {default as Db, iDesignInput} from '../db';

export default class DbDesign
{
  db: Db;
  
  constructor (db: Db)
  {
    this.db = db;
  }
  
  show (designId: string, showName: string, id: string, callback: (err?: Err, data?: any)=>any = ()=>{}, tries: number = 0)
  {
    if (!designId) {
      callback(Err.missing('design'));
      return;
    }
    tries++;
    this._performShow(designId, showName, id, (err, result) => {
      if (err) {
        let _afterResolve = (err: Err) => {
          if (err)
            callback(err);
          else
            this.show(designId, showName, id, callback, tries);
        };
        if (tries <= 1 && err.name == "no_db_file")
          this.db.create(_afterResolve);
        else if (tries <= 2 && err.name == "not_found")
          this._persistDesign(designId, { 'shows': [showName] }, _afterResolve);
        else if (tries <= this.db.maxTries && err.name == "conflict")
          this._performRetrieveLatest(designId, _afterResolve);
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performShow (designId: string, showName: string, id: string, callback: (err: Err, data: any)=>any)
  {
    this.db.raw.show(designId, showName, id, (err: any, data: any) => {
      callback(Err.make('design', err), data);
    });
  }
  
  view (designId: string, viewName: string, params: Object, callback: (err?: Err, data?: any)=>any = ()=>{}, tries: number = 0)
  {
    if (!designId) {
      callback(Err.missing('doc'));
      return;
    }
    tries++;
    this._performView(designId, viewName, params, (err, result) => {
      if (err) {
        let _afterResolve = (err: Err) => {
          if (err)
            callback(err);
          else
            this.view(designId, viewName, params, callback, tries);
        };
        if (tries <= 1 && err.name == "no_db_file")
          this.db.create(_afterResolve);
        else if (tries <= 2 && err.name == "not_found")
          this._persistDesign(designId, { 'views': [viewName] }, _afterResolve);
        else if (tries <= this.db.maxTries && err.name == "conflict")
          this._performRetrieveLatest(designId, _afterResolve);
        else
          callback(err);
      }
      else
        callback(undefined, result); // executed successfully
    });
  }
  
  private _performView (designId: string, viewName: string, params: Object, callback: (err: Err, data: any)=>any)
  {
    this.db.raw.view(designId, viewName, params, (err: any, data: any) => {
      callback(Err.make('design', err), data);
    });
  }
  
  private _performRetrieveLatest (designId: string, callback: (err: Err, result: { [index: string]: any })=>any)
  {
    this.db.raw.get('_design/' + designId, (err: any, result: any) => {
      callback(Err.make('design', err), result);
    });
  }
  
  private _persistDesign (designId: string, kinds: { [index: string]: string[] }, callback: (err: Err)=>any)
  {
    let design = this.db.designs[designId];
    if (!design) {
      callback(new Err('design', "not_defined", "No design specified for: " + designId));
      return;
    }
    // generate design document
    let body: iDesignInput = { language: design.language };
    for (let kind in kinds) {
      switch (kind) {
        case 'shows':
        body.shows = {};
        for (let name of kinds[kind]) {
          body.shows[name] = design.shows[name] || null;
        }
        break;
        case 'views':
        body.views = {};
        for (let name of kinds[kind]) {
          body.views[name] = design.views[name] || null;
        }
        break;
      }
    }
    // persist document
    this.db.doc.updateOrPersist('_design/' + designId, body, callback);
  }
}
