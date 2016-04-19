import { default as Doc } from '../doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    list(): string[];
    exists(name: string): boolean;
    persist(name: string, data: any, mimeType: string, callback?: (err?: Error) => any, tries?: number): void;
    write(name: string, mimetype: string, callback?: (err?: Error) => any): any;
    private _performPersist(name, data, mimeType, callback);
    get(name: string, callback?: (err?: Error, data?: any) => any): void;
    read(name: string, callback?: (err?: Error) => any): any;
    erase(name: string, callback?: (err?: Error) => any, tries?: number): void;
    private _performErase(name, callback);
}
