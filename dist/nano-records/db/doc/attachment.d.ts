import { default as Err } from '../../err';
import { default as Doc } from '../../doc';
import { default as DbDoc } from '../doc';
export default class DbDocAttachment {
    doc: DbDoc;
    constructor(doc: DbDoc);
    read(id: string, name: string, callback?: (err?: Err, data?: any) => any): void;
    private _performRead(id, name, callback);
    readStream(id: string, name: string, callback?: (err?: Err) => any): any;
    private _performReadStream(id, name, callback);
    write(id: string, name: string, data: any, mimeType: string, callback?: (err?: Err, doc?: Doc) => any): void;
    forcedWrite(id: string, name: string, data: any, mimeType: string, callback?: (err?: Err, doc?: Doc) => any): void;
    private _performWriteAndInstantiateDoc(id, name, data, mimeType, callback);
    private _performWrite(id, name, data, mimeType, callback);
    destroy(id: string, name: string, callback?: (err?: Err) => any): void;
}
