interface SimpleObject {
    [index: string]: any;
}
interface DesignInputs {
    [index: string]: DesignInput;
}
interface DesignInput {
    language?: string,
    shows?: { [index: string]: string };
    views?: { [index: string]: { map: string, reduce?: string }};
}
interface ViewResult {
    total_rows: number;
    offset: number;
    rows: ViewRow[];
}
interface ViewRow {
    id: string;
    key: any;
    value: any;
    doc: SimpleObject;
}
interface NanoError {
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
