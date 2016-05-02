export interface NanoError {
    name?: string;
    error?: string;
    reason?: string;
    scope?: string;
    statusCode?: number;
    code?: string;
    request?: Object;
    headers?: Object;
    errid?: string;
    description?: string;
    message?: string;
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
    static conflict(scope: string, err?: NanoError): Err;
    static verifyFailed(scope: string): Err;
}
