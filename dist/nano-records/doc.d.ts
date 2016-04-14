import { default as Db } from './db';
import { default as DocAttachment } from './doc/attachment';
export default class Doc {
    body: {
        [index: string]: any;
    };
    db: Db;
    attachment: DocAttachment;
    constructor(db: Db, body?: {
        [index: string]: any;
    });
    getId(): string;
    getRev(): string;
    retrieveLatest(callback?: (err?: Error) => any): void;
    private _performRetrieveLatest(callback);
    update(body: Object, callback?: (err?: Error) => any, tries?: number): void;
    private _performUpdate(body, callback);
    private _extendBody(body);
    destroy(callback?: (err?: Error) => any, tries?: number): void;
    private _performDestroy(callback);
}
