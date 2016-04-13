import { default as Doc } from '../doc';
export default class DocAttachment {
    doc: Doc;
    constructor(doc: Doc);
    add(name: string, data: any, mimeType: string, callback?: Function, tries?: number): void;
    stream(name: string, mimetype: string, callback?: Function): any;
    private _performAdd(name, data, mimeType, callback);
    get(name: string, callback?: Function): void;
    private _performGet(name, callback);
    destroy(name: string, callback?: Function, tries?: number): void;
    private _performDestroy(name, callback);
}
