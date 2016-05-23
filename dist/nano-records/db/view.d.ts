import { default as Db } from '../db';
import { ErrListCallback } from '../list';
export default class DbView {
    db: Db;
    constructor(db: Db);
    only(keys: string | string[], values: string | string[], params: SimpleObject, callback: ErrListCallback): void;
    all(keys: string | string[], params: SimpleObject, callback: ErrListCallback): void;
    private _only(keys, values, params, callback, tries?);
    private _updateNanoRecordsDesign(name, view, callback);
    read(id: string, name: string, params: SimpleObject, callback?: ErrListCallback): void;
    private _read(id, name, params, callback, tries?);
    private _performRead(id, name, params, callback);
    private _updateDesign(id, names, callback);
}
