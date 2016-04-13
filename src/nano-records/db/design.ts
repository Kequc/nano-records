import {default as Db, iDesignInput} from '../db';

export default class DbDesign
{
  db: Db;
  
  constructor (db: Db)
  {
    this.db = db;
  }
  
  show (designId: string, showName: string, id: string, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.raw.show(designId, showName, id, (err: Error, result: { [index: string]: any }) => {
      if (err) {
        if (tries <= 1 && (['missing', 'deleted', 'missing_named_show'].indexOf(err.message) > -1)) {
          this._persistDesign(designId, 'shows', showName, (err: Error) => {
            if (err)
              callback(err);
            else
              this.show(designId, showName, id, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(null, result); // executed successfully
    });
  }
  
  view (designId: string, viewName: string, params: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.raw.view(designId, viewName, params, (err: Error, result: { [index: string]: any }) => {
      if (err) {
        if (tries <= 1 && (['missing', 'deleted', 'missing_named_view'].indexOf(err.message) > -1)) {
          this._persistDesign(designId, 'views', viewName, (err: Error) => {
            if (err)
              callback(err);
            else
              this.view(designId, viewName, params, callback, tries);
          });
        }
        else
          callback(err);
      }
      else
        callback(null, result); // executed successfully
    });
  }
  
  private _persistDesign (designId: string, kind: string, name: string, callback: Function)
  {
    let design = this.db.designs[designId];
    if (!design) {
      callback(new Error("No design specified for: " + designId));
      return;
    }
    // persist document
    let body: iDesignInput = { language: design.language };
    switch (kind) {
      case 'shows':
      body.shows = {};
      body.shows[name] = design.shows[name] || null;
      break;
      case 'views':
      body.views = {};
      body.views[name] = design.views[name] || null;
      break;
    }
    this.db.doc.updateOrCreate('_design/' + designId, body, callback);
  }
}
