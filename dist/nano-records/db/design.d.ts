import { ErrOutputCallback } from '../err';
import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    show(id: string, name: string, docId: string, callback?: ErrOutputCallback): void;
    private _show(id, name, docId, callback, tries?);
    private _performShow(id, name, docId, callback);
    view(id: string, name: string, params: SimpleObject, callback?: ErrOutputCallback): void;
    private _view(id, name, params, callback, tries?);
    private _performView(id, name, params, callback);
    private _updateDesign(id, kinds, callback);
}
