/* class Err
 * 
 * This is a utility class for manufacturing errors returned from nano
 * into a more structured format. Calling `make` and delivering the
 * original error should result in something sane.
 * 
 * This is used internally as well as delivered to the user it acts as
 * a sanity check for nano erros.
 * 
 */

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
  
  static resultFunc (scope: string, callback: (err: Err, result?: any)=>any): Function
  {
    return (raw: iNanoError, result: any) => {
      let err = this.make(scope, raw);
      if (err)
        callback(err);
      else
        callback(undefined, result);
    }
  }
  
  static make (scope: string, err: iNanoError): Err {
    if (!err)
      return;
    else if (err.statusCode == 412) {
      // database create requested when database exists
      return new Err(scope, "db_already_exists", "Database already exists.", err);
    }
    else if ((err.statusCode == 404 && scope == 'db') || err.reason == "no_db_file") {
      // database destroy requested when database does not exist
      // database missing error
      return new Err(scope, "no_db_file", "Database missing.", err);
    }
    else if (err.statusCode == 404) {
      // something missing
      return this.missing(scope, err);
    }
    else if (err.statusCode == 409) {
      // revision mismatch
      return this.conflict(scope, err);
    }
    else if (err.statusCode == 500 && ['function_clause', 'case_clause'].indexOf(err.reason) > -1) {
      // design broken somehow
      return new Err(scope, "malformed_script", "Problem with one of your designs.", err);
    }
    else if (err.statusCode == 500 && scope == 'design' && err.error == "TypeError") {
      // NANO: that is one hell of an error, man crazy
      // seems to only occur when a show is missing
      // views do not report such a crazy error nor need this exception
      return this.missing(scope, err);
    }
    else if (err.code == 'ECONNREFUSED') {
      // could not connect to the database
      return new Err(scope, "connection_refused", "Could not connect to database.", err);
    }
    else {
      // best guess!
      return new Err(scope, err.reason, err.description, err);
    }
  }
  
  // common ones
  
  static missing (scope: string, err?: iNanoError): Err {
    return new Err(scope, "not_found", "Not found.", err);
  }
  
  static missingId (scope: string): Err {
    return new Err(scope, "missing_id", "Id parameter required.");
  }
  
  static conflict (scope: string, err?: iNanoError): Err {
    return new Err(scope, "conflict", "There was a conflict.", err);
  }
  
  static verifyFailed (scope: string): Err {
    return new Err(scope, "verify_failed", "Verify code mismatch.");
  }
}
