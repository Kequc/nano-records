import { default as Err } from './err';
import { default as DbDoc } from './db/doc';
import { default as DbDesign } from './db/design';
export interface ErrCallback {
    (err?: Err): any;
}
export interface DesignInputs {
    [index: string]: DesignInput;
}
export interface DesignInput {
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
    designs: DesignInputs;
    raw: any;
    doc: DbDoc;
    design: DbDesign;
    constructor(nano: any, dbName: string, designs?: DesignInputs);
    create(callback?: ErrCallback): void;
    private _performCreate(callback);
    destroy(verify: string, callback?: ErrCallback): void;
    private _performDestroy(callback);
    reset(verify: string, callback?: ErrCallback): void;
}
