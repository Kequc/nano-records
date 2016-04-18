import { default as DbDoc } from '../doc';
export default class DbDocAttachment {
    doc: DbDoc;
    constructor(doc: DbDoc);
    persist(id: string, name: string, data: any, mimeType: string, callback?: (err: Error) => any): void;
    get(id: string, name: string, callback?: (err?: Error, data?: any) => any): void;
    read(id: string, name: string, callback?: (err?: Error) => any): any;
    private _performGet(id, name, callback);
    destroy(id: string, name: string, callback?: (err: Error) => any): void;
}
