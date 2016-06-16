import { ErrCallback, ErrHeadCallback } from './err';
import { default as Db } from './db';
import { ErrDocCallback } from './doc';
import { default as DbDocAttachment } from './db-doc-attachment';
export default class DbDoc {
    db: Db;
    attachment: DbDocAttachment;
    constructor(db: Db);
    create(body: SimpleObject, callback?: ErrDocCallback): void;
    read(id: string, callback?: ErrDocCallback): void;
    private _read(id, callback, tries?);
    private _performRead(id, callback);
    write(id: string, body: SimpleObject, callback?: ErrDocCallback): void;
    private _write(id, body, callback, tries?);
    update(id: string, body: SimpleObject, callback?: ErrDocCallback): void;
    private _update(id, body, callback);
    updateOrWrite(id: string, body: SimpleObject, callback?: ErrDocCallback): void;
    private _updateOrWrite(id, body, callback, tries?);
    private _performWriteAndInstantiateDoc(id, rev, body, callback, tries?);
    private _performWrite(id, rev, body, callback);
    destroy(id: string, callback?: ErrCallback): void;
    private _destroy(id, callback, tries?);
    private _performDestroy(id, rev, callback);
    head(id: string, callback?: ErrHeadCallback): void;
    private _head(id, callback, tries?);
    private _performHead(id, callback);
}
