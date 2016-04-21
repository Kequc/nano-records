import { default as Err } from '../../err';
import { default as DbDoc } from '../doc';
export default class DbDocAttachment {
    doc: DbDoc;
    constructor(doc: DbDoc);
    write(id: string, name: string, data: any, mimeType: string, callback?: (err?: Err) => any): void;
    private _performWrite(id, name, data, mimeType, callback);
    read(id: string, name: string, callback?: (err?: Err, data?: any) => any): void;
    private _performRead(id, name, callback);
    readStream(id: string, name: string, callback?: (err?: Err) => any): any;
    private _performReadStream(id, name, callback);
    destroy(id: string, name: string, callback?: (err?: Err) => any): void;
}
