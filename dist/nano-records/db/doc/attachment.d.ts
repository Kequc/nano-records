import { default as Err } from '../../err';
import { default as DbDoc } from '../doc';
export default class DbDocAttachment {
    doc: DbDoc;
    constructor(doc: DbDoc);
    persist(id: string, name: string, data: any, mimeType: string, callback?: (err?: Err) => any): void;
    get(id: string, name: string, callback?: (err?: Err, data?: any) => any): void;
    private _performGet(id, name, callback);
    read(id: string, name: string, callback?: (err?: Err) => any): any;
    private _performRead(id, name, callback);
    erase(id: string, name: string, callback?: (err?: Err) => any): void;
}
