declare var require: any;
declare var _: any;
declare var maxTries: number;
declare class NanoRecord {
    private _parent;
    data: Object;
    constructor(parent: NanoRecords, data?: Object);
    attachment: Object;
    private _attachmentFind(name, callback?);
    private _performAttachmentFind(name, callback);
    private _attachmentAdd(name, data, mimeType, callback?, tries?);
    private _attachmentStream(name, mimetype, callback?);
    private _performAttachmentAdd(name, data, mimeType, callback);
    private _attachmentDestroy(name, callback?, tries?);
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
    create(data: Object, callback?: Function, tries?: number): void;
    find(id: string, callback?: Function): void;
    update(id: string, data: Object, callback?: Function): void;
    destroy(id: string, callback?: Function): void;
    view(name: string, data: Object, callback?: Function, tries?: number): void;
}
declare var module: any;
