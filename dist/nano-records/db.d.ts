import { default as Err } from './err';
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
    reset(verify: string, callback?: (err?: Err) => any): void;
    create(verify: string, callback?: (err?: Err) => any): void;
    private _performCreate(callback);
    destroy(verify: string, callback?: (err?: Err) => any): void;
    private _performDestroy(callback);
}
