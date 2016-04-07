/// <reference path="../typings/main.d.ts" />
declare var deepExtend: any;
declare var maxTries: number;
declare class NanoRecords_Document {
    private _parent;
    body: Object;
    constructor(parent: NanoRecords, body?: Object);
    attachment: {
        get: any;
        add: any;
        stream: any;
        destroy: any;
    };
    attachmentGet(name: string, callback?: Function): void;
    private _performAttachmentGet(name, callback);
    attachmentAdd(name: string, data: any, mimeType: string, callback?: Function, tries?: number): void;
    attachmentStream(name: string, mimetype: string, callback?: Function): any;
    private _performAttachmentAdd(name, data, mimeType, callback);
    attachmentDestroy(name: string, callback?: Function, tries?: number): void;
    private _performAttachmentDestroy(name, callback);
    retrieveLatest(callback?: Function): void;
    private _performRetrieveLatest(callback);
    update(body: Object, callback?: Function, tries?: number): void;
    private _performUpdate(body, callback);
    private _extendData(body);
    destroy(callback?: Function, tries?: number): void;
    private _performDestroy(callback);
}
declare class NanoRecords {
    nano: any;
    dbName: string;
    views: Object;
    db: any;
    constructor(nano: any, dbName: string, views?: Object);
    doc: {
        create: any;
        get: any;
        update: any;
        destroy: any;
        attachment: {
            add: any;
            get: any;
            destroy: any;
        };
    };
    docAttachmentAdd(id: string, name: string, data: any, mimeType: string, callback?: Function): void;
    docAttachmentGet(id: string, name: string, callback?: Function): void;
    docAttachmentDestroy(id: string, name: string, callback?: Function): void;
    docCreate(body: Object, callback?: Function, tries?: number): void;
    docGet(id: string, callback?: Function): void;
    docUpdate(id: string, body: Object, callback?: Function): void;
    docDestroy(id: string, callback?: Function): void;
    view(name: string, params: any, callback?: Function, tries?: number): void;
}
