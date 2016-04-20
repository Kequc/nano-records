import { default as Err } from '../err';
import { default as Doc } from '../doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    list(): string[];
    exists(name: string): boolean;
    write(name: string, data: any, mimeType: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performWrite(name, data, mimeType, callback);
    writable(name: string, mimetype: string, callback?: (err?: Err) => any): any;
    private _performWritable(name, data, mimeType, callback);
    read(name: string, callback?: (err?: Err, data?: any) => any): void;
    readable(name: string, callback?: (err?: Err) => any): any;
    destroy(name: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performDestroy(name, callback);
}
