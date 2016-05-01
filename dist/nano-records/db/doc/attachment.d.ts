import { default as Err } from '../../err';
import { default as DbDoc } from '../doc';
export default class DbDocAttachment {
    doc: DbDoc;
    constructor(doc: DbDoc);
    read(id: string, name: string, callback?: (err?: Err, data?: any) => any): void;
    private _performRead(id, name, callback);
    readStream(id: string, name: string, callback?: (err?: Err) => any): any;
    private _performReadStream(id, name, callback);
    write(id: string, name: string, data: any, mimeType: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performWrite(id, rev, name, data, mimeType, callback);
    destroy(id: string, name: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performDestroy(id, rev, name, callback);
}
