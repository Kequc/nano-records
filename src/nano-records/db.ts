import {default as Doc} from './doc';
import {default as DbDoc} from './db/doc';
import {default as DbDesign} from './db/design';

export interface iDesignInput {
  language?: string,
  shows?: { [index: string]: string };
  views?: { [index: string]: { map: string, reduce: string }};
}

export default class Db
{
  maxTries: number = 5;
  nano: any;
  dbName: string;
  designs: { [index: string]: iDesignInput } = {};
  raw: any;
  
  doc: DbDoc;
  design: DbDesign;
  
  constructor (nano: any, dbName: string, designs?: { [index: string]: iDesignInput })
  {
    this.nano = nano;
    this.dbName = dbName;
    this._updateDesigns(designs);
    this.raw = this.nano.use(this.dbName);
    
    this.doc = new DbDoc(this);
    this.design = new DbDesign(this);
  }
  
  private _updateDesigns (designs: { [index: string]: iDesignInput } = {})
  {
    for (let key in designs) {
      let design = designs[key] || {};
      this.designs[key] = {
        language: design.language || "javascript",
        shows: design.shows || {},
        views: design.views || {}
      };
    }
  }
}
