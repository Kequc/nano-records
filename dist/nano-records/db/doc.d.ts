import { default as Db } from '../db';
import { default as Doc } from '../doc';
import { default as DbDocAttachment } from './doc/attachment';
export default class DbDoc {
    db: Db;
    attachment: DbDocAttachment;
    constructor(db: Db);
    create(body: {
        [index: string]: any;
    }, callback?: (err?: Error, doc?: Doc) => any, tries?: number): void;
    private _performCreate(body, callback);
    get(id: string, callback?: (err?: Error, doc?: Doc) => any, tries?: number): void;
    private _performGet(id, callback);
    update(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Error) => any): void;
    updateOrCreate(id: string, body: {
        [index: string]: any;
    }, callback?: (err?: Error, doc?: Doc) => any): void;
    destroy(id: string, callback?: (err?: Error) => any): void;
}
