declare module 'dev-null' {
	function devNull(): any;
	export = devNull;
}
declare module 'deep-extend' {
	/*
	 * Recursive object extending.
	 */
	function deepExtend<T, U>(target: T, source: U): T & U;
	function deepExtend<T, U, V>(target: T, source1: U, source2: V): T & U & V;
	function deepExtend<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
	function deepExtend(target: any, ...sources: any[]): any;
	export = deepExtend;
}
declare module 'stream' {
	export var Readable: any;
	export var Writable: any;
}
declare module 'underscore' {
	var methods: any;
	export = methods;
}
