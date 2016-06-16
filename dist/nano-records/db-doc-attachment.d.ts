import { ErrCallback, ErrDataCallback } from './err';
import { default as DbDoc } from './db-doc';
export default class DbDocAttachment {
    doc: DbDoc;
    constructor(doc: DbDoc);
    read(id: string, name: string, callback?: ErrDataCallback): void;
    private _performRead(id, name, callback);
    createReadStream(id: string, name: string, callback?: ErrCallback): any;
    private _emptyStream();
    private _performCreateReadStream(id, name, callback);
    write(id: string, name: string, data: any, mimeType: string, callback?: ErrCallback): void;
    private _write(id, name, data, mimeType, callback, tries?);
    private _performWrite(id, rev, name, data, mimeType, callback);
    destroy(id: string, name: string, callback?: ErrCallback): void;
    private _destroy(id, name, callback, tries?);
    private _performDestroy(id, rev, name, callback);
}
