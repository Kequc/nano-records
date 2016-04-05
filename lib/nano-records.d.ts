declare var require: any;
declare var _: any;
declare class NanoRecord {
    private _parent;
    data: Object;
    constructor(parent: NanoRecords, data?: Object);
    attachmentGet(name: string, callback?: Function): void;
    attachmentAdd(name: string, data: any, mimeType: string, callback?: Function, tries?: number): void;
    attachmentRemove(name: string, callback?: Function): void;
    fetch(callback?: Function): void;
    update(data: Object, callback?: Function, tries?: number): void;
    destroy(callback?: Function, tries?: number): void;
}
declare class NanoRecords {
    nano: any;
    dbName: string;
    views: Object;
    db: any;
    constructor(nano: any, dbName: string, views?: Object);
    create(data: Object, callback?: Function, tries?: number): void;
    update(id: string, data: Object, callback?: Function): void;
    destroy(id: string, callback?: Function): void;
    find(id: string, callback?: Function): void;
    view(name: string, data: Object, callback?: Function, tries?: number): void;
}
declare var module: any;
