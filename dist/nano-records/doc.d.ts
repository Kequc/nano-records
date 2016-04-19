import { default as Err } from './err';
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
    getBody(): {
        [index: string]: any;
    };
    retrieveLatest(callback?: (err?: Err) => any): void;
    private _performRetrieveLatest(callback);
    update(body: Object, callback?: (err?: Err) => any, tries?: number): void;
    private _performUpdate(body, callback);
    private _extendBody(body);
    erase(callback?: (err?: Err) => any, tries?: number): void;
    private _performErase(callback);
}
