import { default as Err } from '../err';
import { default as Doc } from '../doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    list(): string[];
    exists(name: string): boolean;
    persist(name: string, data: any, mimeType: string, callback?: (err?: Err) => any, tries?: number): void;
    write(name: string, mimetype: string, callback?: (err?: Err) => any): any;
    private _performPersist(name, data, mimeType, callback);
    get(name: string, callback?: (err?: Err, data?: any) => any): void;
    read(name: string, callback?: (err?: Err) => any): any;
    erase(name: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performErase(name, callback);
}
