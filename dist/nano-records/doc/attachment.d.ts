import { default as Err } from '../err';
import { default as Doc } from '../doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    read(name: string, callback?: (err?: Err, data?: any) => any): void;
    createReadStream(name: string, callback?: (err?: Err) => any): any;
    write(name: string, data: any, mimeType: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performWrite(name, data, mimeType, callback);
    createWriteStream(name: string, mimeType: string, callback?: (err?: Err) => any): any;
    private _performCreateWriteStream(name, data, mimeType, callback);
    destroy(name: string, callback?: (err?: Err) => any, tries?: number): void;
    private _performDestroy(name, callback);
    list(): string[];
    exists(name: string): boolean;
}
