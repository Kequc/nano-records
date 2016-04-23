export interface iNanoError {
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
    raw: iNanoError;
    constructor(scope: string, name?: string, message?: string, raw?: iNanoError);
    static resultFunc(scope: string, callback: (err: Err, result?: any) => any): Function;
    static make(scope: string, err: iNanoError): Err;
    static missing(scope: string, err?: iNanoError): Err;
    static missingId(scope: string): Err;
    static verifyFailed(scope: string): Err;
}
