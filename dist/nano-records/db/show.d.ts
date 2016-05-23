import { ErrResultCallback } from '../err';
import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    read(id: string, name: string, docId: string, callback?: ErrResultCallback): void;
    private _read(id, name, docId, callback, tries?);
    private _performRead(id, name, docId, callback);
    private _updateDesign(id, names, callback);
}
