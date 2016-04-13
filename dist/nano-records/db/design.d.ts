import { default as Db } from '../db';
export default class DbDesign {
    db: Db;
    constructor(db: Db);
    show(designId: string, showName: string, id: string, callback?: Function, tries?: number): void;
    view(designId: string, viewName: string, params: Object, callback?: Function, tries?: number): void;
}
