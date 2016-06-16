import { default as Err } from './err';
import { default as Db } from './db';
import { default as Doc } from './doc';
export interface ErrListCallback {
    (err?: Err, list?: List): any;
}
export default class List {
    total: number;
    offset: number;
    rows: ViewRow[];
    db: Db;
    constructor(db: Db, body?: ViewResult);
    ids(): string[];
    keys(): any[];
    values(): any[];
    docs(): Doc[];
    doc(index: number): Doc;
    private _docForRow(row);
}
