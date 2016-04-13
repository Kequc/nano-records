import { default as Db } from '../db';
import { default as DbDocAttachment } from './doc/attachment';
export default class DbDoc {
    db: Db;
    attachment: DbDocAttachment;
    constructor(db: Db);
    create(body: {
        [index: string]: any;
    }, callback?: Function, tries?: number): void;
    private _performCreate(body, callback);
    private _performDbCreate(callback);
    get(id: string, callback?: Function): void;
    private _performGet(id, callback);
    update(id: string, body: {
        [index: string]: any;
    }, callback?: Function): void;
    updateOrCreate(id: string, body: {
        [index: string]: any;
    }, callback?: Function): void;
    destroy(id: string, callback?: Function): void;
}
