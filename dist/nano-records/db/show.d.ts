import { ErrResultCallback } from '../err';
import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    explicit(id: string, design: string, name: string, callback?: ErrResultCallback): void;
    private _explicit(id, design, name, callback, tries?);
    private _performExplicit(id, design, name, callback);
    private _updateDesign(designId, names, callback);
}
