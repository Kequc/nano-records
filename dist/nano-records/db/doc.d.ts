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
    }, callback?: (err?: Err, doc?: Doc) => any, tries?: number): void;
    write(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any): void;
    update(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Err, doc?: Doc) => any): void;
    private _performWriteAndInstantiateDoc(id, body, callback);
    private _performWrite(id, body, callback);
    read(id: string, callback?: (err?: Err, doc?: Doc) => any, tries?: number): void;
    private _performRead(id, callback);
    head(id: string, callback?: (err?: Err, data?: any) => any): void;
    private _performHead(id, callback);
    destroy(id: string, callback?: (err?: Err) => any): void;
}
