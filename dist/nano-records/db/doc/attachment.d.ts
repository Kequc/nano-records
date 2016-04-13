import { default as DbDoc } from '../doc';
export default class DbDocAttachment {
    dbDoc: DbDoc;
    constructor(dbDoc: DbDoc);
    add(id: string, name: string, data: any, mimeType: string, callback?: Function): void;
    get(id: string, name: string, callback?: Function): void;
    destroy(id: string, name: string, callback?: Function): void;
}
