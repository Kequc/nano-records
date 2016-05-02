import { default as Err } from '../err';
import { default as Db } from '../db';
import { default as Doc } from '../doc';
import { default as DbDocAttachment } from './doc/attachment';
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
    forcedWrite(id: string, body: SimpleObject, callback?: ErrDocCallback): void;
    private _forcedWrite(id, body, callback, tries?);
    update(id: string, body: SimpleObject, callback?: ErrDocCallback): void;
    private _update(id, body, callback);
    forcedUpdate(id: string, body: SimpleObject, callback?: ErrDocCallback): void;
    private _forcedUpdate(id, body, callback, tries?);
    private _performWriteAndInstantiateDoc(id, rev, body, callback, tries?);
    private _performWrite(id, rev, body, callback);
    destroy(id: string, callback?: ErrCallback): void;
    private _destroy(id, callback, tries?);
    private _performDestroy(id, rev, callback);
    head(id: string, callback?: HeadCallback): void;
    private _head(id, callback, tries?);
    private _performHead(id, callback);
}
