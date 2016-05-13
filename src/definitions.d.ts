interface SimpleObject {
  [index: string]: any;
}
interface DesignInputs {
  [index: string]: DesignInput;
}
interface DesignInput {
  language?: string,
  shows?: { [index: string]: string };
  views?: { [index: string]: { map: string, reduce: string }};
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
