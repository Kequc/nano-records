import { default as Err } from './err';
import { default as Db } from './db';
import { default as DocAttachment } from './doc/attachment';
export interface ErrCallback {
    (err?: Err): any;
}
export interface ErrDocCallback {
    (err?: Err, doc?: Doc): any;
}
export interface ErrResultCallback {
    (err?: Err, result?: SimpleObject): any;
}
export interface HeadCallback {
    (err?: Err, rev?: string, result?: SimpleObject): any;
}
export interface SimpleObject {
    [index: string]: any;
}
export default class Doc {
    body: {
        [index: string]: any;
    };
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
    head(callback?: HeadCallback): void;
    private _head(callback);
    getId(): string;
    getRev(): string;
    getCreated(): Date;
    getUpdated(): Date;
    getBody(): SimpleObject;
}
