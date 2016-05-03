import { ErrCallback } from './err';
import { default as DbDoc } from './db/doc';
import { default as DbDesign } from './db/design';
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
