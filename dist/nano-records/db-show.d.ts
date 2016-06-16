import { ErrResultCallback } from './err';
import { default as Db } from './db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    catalog(id: string, design: string, name: string, callback?: ErrResultCallback): void;
    private _catalog(id, design, name, callback, tries?);
    private _performCatalog(id, design, name, callback);
    private _updateDesign(designId, names, callback);
}
