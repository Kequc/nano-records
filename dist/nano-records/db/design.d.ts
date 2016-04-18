import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    show(designId: string, showName: string, id: string, callback?: (err?: Error, data?: any) => any, tries?: number): void;
    view(designId: string, viewName: string, params: Object, callback?: (err?: Error, data?: any) => any, tries?: number): void;
    private _performRetrieveLatest(designId, callback);
    private _persistDesign(designId, kinds, callback);
}
