import { default as DbDoc } from './db/doc';
import { default as DbDesign } from './db/design';
export interface iDesignInput {
    language?: string;
    shows?: {
        [index: string]: string;
    };
    views?: {
        [index: string]: {
            map: string;
            reduce: string;
        };
    };
}
export interface iNanoError {
    name: string;
    error?: string;
    reason?: string;
    scope?: string;
    statusCode?: number;
    request?: Object;
    headers?: Object;
    errid?: string;
    description?: string;
    message: string;
}
export default class Db {
    maxTries: number;
    nano: any;
    dbName: string;
    designs: {
        [index: string]: iDesignInput;
    };
    raw: any;
    doc: DbDoc;
    design: DbDesign;
    constructor(nano: any, dbName: string, designs?: {
        [index: string]: iDesignInput;
    });
    persist(callback?: (err: Error) => any): void;
    private _performPersist(callback);
}
