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
    this.db.raw.show(designId, showName, id, function (err: Error, result: { [index: string]: any }) {
      if (err) {
        if (tries <= 1 && (['missing', 'deleted', 'missing_named_show'].indexOf(err.message) > -1)) {
          let design = this.designs[designId];
          if (!design)
            callback(new Error("No design specified for: " + designId));
          else {
            let shows: { [index: string]: string } = {};
            shows[showName] = design.shows[showName]; 
            this.db.doc.updateOrCreate('_design/' + designId, { language: design.language, shows: shows }, function (err: Error) {
              if (err)
                callback(err);
              else
                this.show(designId, showName, id, callback, tries);
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
  
  view (designId: string, viewName: string, params: Object, callback: Function = ()=>{}, tries: number = 0)
  {
    tries++;
    this.db.raw.view(designId, viewName, params, function (err: Error, result: { [index: string]: any }) {
      if (err) {
        if (tries <= 1 && (['missing', 'deleted', 'missing_named_view'].indexOf(err.message) > -1)) {
          let design = this.designs[designId];
          if (!design)
            callback(new Error("No design specified for: " + designId));
          else {
            let views: { [index: string]: string } = {};
            views[viewName] = design.views[viewName]; 
            this.db.doc.updateOrCreate('_design/' + designId, { language: design.language, views: views }, function (err: Error) {
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
    }.bind(this));
  }
}
