export declare namespace DbViewBuilder {
    function mapFunction(keys: string | string[], values?: string | string[]): string;
    function emitKey(keys: string | string[]): string;
    function emitValue(keys: string | string[]): string;
    function generateName(keys: string | string[], values?: string | string[]): string;
}
