import {default as Db} from '../db';

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
          let design = this.db.designs[designId];
          if (!design)
            callback(new Error("No design specified for: " + designId));
          else {
            let shows: { [index: string]: any } = {};
            shows[showName] = design.shows[showName]; 
            this.db.doc.updateOrCreate('_design/' + designId, { language: design.language, shows: shows }, (err: Error) => {
              if (err)
                callback(err);
              else
                this.show(designId, showName, id, callback, tries);
            });
          }
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
          let design = this.db.designs[designId];
          if (!design)
            callback(new Error("No design specified for: " + designId));
          else {
            let views: { [index: string]: any } = {};
            views[viewName] = design.views[viewName]; 
            this.db.doc.updateOrCreate('_design/' + designId, { language: design.language, views: views }, (err: Error) => {
              if (err)
                callback(err);
              else
                this.view(designId, viewName, params, callback, tries);
            });
          }
        }
        else
          callback(err);
      }
      else
        callback(null, result); // executed successfully
    });
  }
}
