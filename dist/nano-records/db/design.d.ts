import { default as Err } from '../err';
import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    show(designId: string, showName: string, id: string, callback?: (err?: Err, data?: any) => any, tries?: number): void;
    private _performShow(designId, showName, id, callback);
    view(designId: string, viewName: string, params: Object, callback?: (err?: Err, data?: any) => any, tries?: number): void;
    private _performView(designId, viewName, params, callback);
    private _performRetrieveLatest(designId, callback);
    private _persistDesign(designId, kinds, callback);
}
