/* namespace DbViewBuilder
 * 
 * Chainable view builder class. Intended to be
 * re-used and gather results from a view. 
 * 
 */

// expertimental
// under development

// import {default as Err} from '../../err';
// import {default as List, ErrListCallback} from '../../list';
// import {DbViewBuilder} from '../view/builder';
// import _ = require('underscore');

// export default class ViewHelper
// {
//   private _name: string;
//   private _descending: boolean = false;
//   private _limit: number;
//   private _page: number = 0;
//   private _next: { key: string[]|string, keyDocId: string };
//   private _search: { key?: any, keys?: any } = {};
  
//   constructor (name: string)
//   {
//     this._name = name;
//   }
  
//   descending (yess: boolean = true): ViewHelper
//   {
//     this._descending = yess;
//     return this;
//   }
  
//   paginate (limit?: number): ViewHelper
//   {
//     this._limit = limit;
//     return this;
//   }
  
//   read (key: any[]|any, callback: ()=>{}): ViewHelper
//   {
//     return this;
//   }
  
//   readAll (keys: any[], callback: ()=>{}): ViewHelper
//   {
//     return this;
//   }
  
//   more (callback: Function): ViewHelper
//   {
//     let params: SimpleObject = {};
//     if (this._page && this._next) {
//       params['startkey'] = this._next.key;
//       params['startkey_docid'] = this._next.keyDocId;
//       this._read()
//     }
//     else {
//       callback(new Err('view', "Reached end of results"));
//     }
//     return this;
//   }
  
//   private _read (design: string, name: string, extension: SimpleObject, callback: Function)
//   {
//     let params: SimpleObject = {};
//     if (this._descending)
//       params['descending'] = true;
//     if (this._limit)
//       params['limit'] = this._limit + 1;
//     _.extend(params, extension);
//     this._performRead(design, name, params, (err, result) => {
//       if (err)
//         callback(err);
//       else {
//         if (params['limit'] && result.rows.length >= params['limit']) {
//           let next = result.rows.pop();
//           this._next = { key: next.key, keyDocId: next.id };
//         }
//         else
//           this._next = undefined;
//       }
//     });
//   }
// }
