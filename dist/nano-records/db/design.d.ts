import { default as Err } from '../err';
import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    show(id: string, name: string, docId: string, callback?: (err?: Err, data?: any) => any, tries?: number): void;
    private _performShow(id, name, docId, callback);
    view(id: string, name: string, params: Object, callback?: (err?: Err, data?: any) => any, tries?: number): void;
    private _performView(id, name, params, callback);
    private _performRetrieveLatest(id, callback);
    private _updateDesign(id, kinds, callback);
}
