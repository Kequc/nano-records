export interface iNanoError {
    name?: string;
    error?: string;
    reason?: string;
    scope?: string;
    statusCode?: number;
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
    static make(scope: string, err: iNanoError): Err;
    static missing(scope: string, err?: iNanoError): Err;
}
