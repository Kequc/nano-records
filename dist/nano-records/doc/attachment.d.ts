import { default as Doc } from '../doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    exists(name: string): boolean;
    add(name: string, data: any, mimeType: string, callback?: (err?: Error) => any, tries?: number): void;
    write(name: string, mimetype: string, callback?: (err?: Error) => any): any;
    private _performAdd(name, data, mimeType, callback);
    get(name: string, callback?: (err?: Error, data?: any) => any): void;
    read(name: string, callback?: (err?: Error) => any): any;
    destroy(name: string, callback?: (err?: Error) => any, tries?: number): void;
    private _performDestroy(name, callback);
}
