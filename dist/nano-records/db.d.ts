import { ErrCallback } from './err';
import { default as DbDoc } from './db-doc';
import { default as DbView } from './db-view';
import { default as DbShow } from './db-show';
export default class Db {
    maxTries: number;
    nano: any;
    dbName: string;
    designs: DesignInputs;
    raw: any;
    doc: DbDoc;
    view: DbView;
    show: DbShow;
    constructor(nano: any, dbName: string, designs?: DesignInputs);
    create(callback?: ErrCallback): void;
    private _performCreate(callback);
    destroy(verify: string, callback?: ErrCallback): void;
    private _performDestroy(callback);
    reset(verify: string, callback?: ErrCallback): void;
}
