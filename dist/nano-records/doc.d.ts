import { default as Db } from './db';
import { default as DocAttachment } from './doc/attachment';
export default class Doc {
    body: {
        [index: string]: any;
    };
    db: Db;
    attachment: DocAttachment;
    constructor(db: Db, body?: Object);
    getId(): string;
    getRev(): string;
    hasAttachment(name: string): boolean;
    retrieveLatest(callback?: Function): void;
    private _performRetrieveLatest(callback);
    update(body: Object, callback?: Function, tries?: number): void;
    private _performUpdate(body, callback);
    private _extendBody(body);
    destroy(callback?: Function, tries?: number): void;
    private _performDestroy(callback);
}
