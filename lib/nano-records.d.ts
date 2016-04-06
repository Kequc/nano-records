declare var require: any;
declare var _: any;
declare var maxTries: number;
declare class NanoRecord {
    private _parent;
    data: Object;
    constructor(parent: NanoRecords, data?: Object);
    attachment: Object;
    attachmentFind(name: string, callback?: Function): void;
    private _performAttachmentFind(name, callback);
    attachmentAdd(name: string, data: any, mimeType: string, callback?: Function, tries?: number): void;
    attachmentStream(name: string, mimetype: string, callback?: Function): any;
    private _performAttachmentAdd(name, data, mimeType, callback);
    attachmentDestroy(name: string, callback?: Function, tries?: number): void;
    private _performAttachmentDestroy(name, callback);
    retrieveLatest(callback?: Function): void;
    private _performRetrieveLatest(callback);
    update(data: Object, callback?: Function, tries?: number): void;
    private _performUpdate(data, callback);
    destroy(callback?: Function, tries?: number): void;
    private _performDestroy(callback);
}
declare class NanoRecords {
    nano: any;
    dbName: string;
    views: Object;
    db: any;
    constructor(nano: any, dbName: string, views?: Object);
    docs: Object;
    docsCreate(data: Object, callback?: Function, tries?: number): void;
    docsFind(id: string, callback?: Function): void;
    docsUpdate(id: string, data: Object, callback?: Function): void;
    docsDestroy(id: string, callback?: Function): void;
    view(name: string, data: Object, callback?: Function, tries?: number): void;
}
declare var module: any;
