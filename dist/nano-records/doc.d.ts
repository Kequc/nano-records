import { default as Err } from './err';
import { default as Db } from './db';
import { default as DocAttachment } from './doc/attachment';
export default class Doc {
    body: {
        [index: string]: any;
    };
    _latestRev: string;
    db: Db;
    attachment: DocAttachment;
    constructor(db: Db, body?: {
        [index: string]: any;
    }, result?: {
        [index: string]: any;
    });
    getId(): string;
    getRev(): string;
    getBody(): {
        [index: string]: any;
    };
    read(callback?: (err?: Err) => any): void;
    private _performRead(callback);
    head(callback?: (err?: Err, data?: any) => any): void;
    write(body: {
        [index: string]: any;
    }, callback?: (err?: Err) => any, tries?: number): void;
    private _performWrite(body, callback);
    update(body: {
        [index: string]: any;
    }, callback?: (err?: Err) => any, tries?: number): void;
    private _performUpdate(body, callback);
    private _extendBody(body);
    destroy(callback?: (err?: Err) => any, tries?: number): void;
    private _performDestroy(callback);
}
