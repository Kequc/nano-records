import { ErrCallback, ErrDataCallback } from './err';
import { default as Doc } from './doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    read(name: string, callback?: ErrDataCallback): void;
    createReadStream(name: string, callback?: ErrCallback): any;
    write(name: string, data: any, mimeType: string, callback?: ErrCallback): void;
    private _write(name, data, mimeType, callback, tries?);
    private _performWrite(name, data, mimeType, callback);
    createWriteStream(name: string, mimeType: string, callback?: ErrCallback): any;
    private _performCreateWriteStream(name, data, mimeType, callback);
    destroy(name: string, callback?: ErrCallback): void;
    private _destroy(name, callback, tries?);
    private _performDestroy(name, callback);
    list(): string[];
    exists(name: string): boolean;
}
