import { default as Db } from '../db';
import { ErrListCallback } from '../list';
export default class DbView {
    db: Db;
    constructor(db: Db);
    only(keys: string | string[], values: string | string[], params: SimpleObject, callback: ErrListCallback): void;
    all(keys: string | string[], params: SimpleObject, callback: ErrListCallback): void;
    private _only(keys, values, params, callback, tries?);
    private _updateNanoRecordsDesign(name, view, callback);
    explicit(design: string, name: string, params: SimpleObject, callback?: ErrListCallback): void;
    private _explicit(design, name, params, callback, tries?);
    private _performExplicit(design, name, params, callback);
    private _updateDesign(designId, names, callback);
}
