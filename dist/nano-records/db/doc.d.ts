import { default as Err } from '../err';
import { default as Db } from '../db';
import { default as Doc } from '../doc';
import { default as DbDocAttachment } from './doc/attachment';
export default class DbDoc {
    db: Db;
    attachment: DbDocAttachment;
    constructor(db: Db);
    create(body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any): void;
    read(id: string, callback?: (err?: Err, doc?: Doc) => any, tries?: number): void;
    private _performRead(id, callback);
    write(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any, tries?: number): void;
    forcedWrite(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any, tries?: number): void;
    update(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any): void;
    forcedUpdate(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any, tries?: number): void;
    private _performWriteAndInstantiateDoc(id, rev, body, callback, tries?);
    private _performWrite(id, rev, body, callback);
    destroy(id: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performDestroy(id, rev, callback);
    head(id: string, callback?: (err?: Err, rev?: string, result?: any) => any, tries?: number): void;
    private _performHead(id, callback);
}
