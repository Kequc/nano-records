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

export default class Err
{
  scope: string;
  name: string;
  message: string;
  
  raw: iNanoError;
  
  constructor (scope: string, name?: string, message?: string, raw?: iNanoError) {
    this.scope = scope;
    this.name = name || "unknown_error";
    this.message = message || "No additional information available.";
    this.raw = raw || {};
  }
  
  static make (scope: string, err: iNanoError): Err {
    if (!err)
      return;
    else if (err.statusCode == 412)
      return new Err(scope, "db_already_exists", "Database already exists.", err);
    else if (err.reason == "no_db_file")
      return new Err(scope, "no_db_file", "Database missing.", err);
    else if (err.statusCode == 404)
      return this.missing(scope, err);
    else if (err.statusCode == 409)
      return new Err(scope, "conflict", "There was a conflict.", err);
    else
      return new Err(scope, err.reason, err.description, err);
  }
  
  static missing (scope: string, err?: iNanoError): Err {
    return new Err(scope, "not_found", "Not found.", err);
  }
}
