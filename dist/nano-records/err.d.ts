export interface ErrCallback {
    (err?: Err): any;
}
export interface ErrResultCallback {
    (err?: Err, result?: SimpleObject): any;
}
export interface ErrHeadCallback {
    (err?: Err, rev?: string, result?: SimpleObject): any;
}
export interface ErrDataCallback {
    (err?: Err, data?: any): any;
}
export default class Err {
    scope: string;
    name: string;
    message: string;
    raw: NanoError;
    constructor(scope: string, name?: string, message?: string, raw?: NanoError);
    static resultFunc(scope: string, callback: (err: Err, result?: any) => any): Function;
    static make(scope: string, err: NanoError): Err;
    static missing(scope: string, err?: NanoError): Err;
    static missingId(scope: string): Err;
    static missingParam(scope: string, name: string): Err;
    static conflict(scope: string, err?: NanoError): Err;
    static verifyFailed(scope: string): Err;
}
