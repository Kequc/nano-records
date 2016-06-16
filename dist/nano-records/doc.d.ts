import { default as Err, ErrCallback, ErrHeadCallback } from './err';
import { default as Db } from './db';
import { default as DocAttachment } from './doc-attachment';
export interface ErrDocCallback {
    (err?: Err, doc?: Doc): any;
}
export default class Doc {
    body: SimpleObject;
    _latestRev: string;
    db: Db;
    attachment: DocAttachment;
    constructor(db: Db, body?: SimpleObject, result?: SimpleObject);
    read(callback?: ErrCallback): void;
    private _read(callback);
    private _performRead(callback);
    write(body: SimpleObject, callback?: ErrCallback): void;
    private _write(body, callback, tries?);
    private _performWrite(body, callback);
    update(body: SimpleObject, callback?: ErrCallback): void;
    private _update(body, callback, tries?);
    private _performUpdate(body, callback);
    destroy(callback?: ErrCallback): void;
    private _destroy(callback, tries?);
    private _performDestroy(callback);
    head(callback?: ErrHeadCallback): void;
    private _head(callback);
    getId(): string;
    getRev(): string;
    getBody(): SimpleObject;
}
