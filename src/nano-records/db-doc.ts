/* class DbDoc
 * 
 * Acts as an entry point to this library's document interfaces.
 * Expects a id to be specified on almost every operation and generally
 * returns a Doc instance.
 * 
 * Most methods mirror those which are available on the Doc
 * class.
 * 
 */

import {default as Err, ErrCallback, ErrHeadCallback, ErrResultCallback} from './err';
import {default as Db} from './db';
import {default as Doc, ErrDocCallback} from './doc';
import {default as DbDocAttachment} from './db-doc-attachment';
import deepExtend = require('deep-extend');

export default class DbDoc
{
    db: Db;
    attachment: DbDocAttachment;
    
    constructor (db: Db)
    {
        this.db = db;
        this.attachment = new DbDocAttachment(this);
    }
    
    create (body: SimpleObject, callback: ErrDocCallback = ()=>{})
    {
        if (!body)
            callback(Err.missingParam('doc', "body"));
        else
            this._performWriteAndInstantiateDoc(undefined, undefined, body, callback);
    }
    
    read (id: string, callback: ErrDocCallback = ()=>{})
    {
        if (!id)
            callback(Err.missingId('doc'));
        else
            this._read(id, callback);
    }
    
    private _read (id: string, callback: ErrDocCallback, tries: number = 0)
    {
        tries++;
        this._performRead(id, (err, result) => {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    this.db.create((err) => {
                        if (err && err.name != "db_already_exists")
                            callback(err);
                        else
                            this._read(id, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, new Doc(this.db, result)); // document found!
        });
    }
    
    private _performRead (id: string, callback: ErrResultCallback)
    {
        this.db.raw.get(id, Err.resultFunc('doc', callback));
    }
    
    write (id: string, body: SimpleObject, callback: ErrDocCallback = ()=>{})
    {
        if (!id)
            callback(Err.missingId('doc'));
        else if (!body)
            callback(Err.missingParam('doc', "body"));
        else
            this._write(id, body, callback);
    }
    
    private _write (id: string, body: SimpleObject, callback: ErrDocCallback, tries: number = 0)
    {
        tries++;
        this.head(id, (err, rev) => {
            this._performWriteAndInstantiateDoc(id, rev, body, (err, doc) => {
                if (err) {
                    if (tries <= this.db.maxTries && err.name == "conflict")
                        this._write(id, body, callback, tries);
                    else
                        callback(err);
                }
                else
                    callback(undefined, doc); // successfully written
            });
        });
    }
    
    update (id: string, body: SimpleObject, callback: ErrDocCallback = ()=>{})
    {
        if (!id)
            callback(Err.missingId('doc'));
        else if (!body)
            callback(Err.missingParam('doc', "body"));
        else
            this._update(id, body, callback);
    }
    
    private _update (id: string, body: SimpleObject, callback: ErrDocCallback)
    {
        this.read(id, (err, doc) => {
            if (err)
                callback(err);
            else {
                // may as well call update on doc
                doc.update(body, (err) => {
                    if (err)
                        callback(err);
                    else
                        callback(undefined, doc); // successfully updated
                });
            }
        });
    }
    
    updateOrWrite (id: string, body: SimpleObject, callback: ErrDocCallback = ()=>{})
    {
        if (!id)
            callback(Err.missingId('doc'));
        else if (!body)
            callback(Err.missingParam('doc', "body"));
        else
            this._updateOrWrite(id, body, callback);
    }
    
    private _updateOrWrite (id: string, body: SimpleObject, callback: ErrDocCallback, tries: number = 0)
    {
        tries++;
        this.update(id, body, (err, doc) => {
            if (err) {
                if (err.name == "not_found") {
                    this._performWriteAndInstantiateDoc(id, undefined, body, (err, doc) => {
                        if (err) {
                            if (tries <= this.db.maxTries && err.name == "conflict") {
                                // document exists
                                this._updateOrWrite(id, body, callback, tries);
                            }
                            else
                                callback(err);
                        }
                        else
                            callback(undefined, doc); // successfully written
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, doc); // successfully updated
        });
    }
    
    private _performWriteAndInstantiateDoc (id: string, rev: string, body: SimpleObject, callback: ErrDocCallback, tries: number = 0)
    {
        tries++;
        let clone = deepExtend({}, body);
        this._performWrite(id, rev, clone, (err, result) => {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    this.db.create((err) => {
                        if (err && err.name != "db_already_exists")
                            callback(err);
                        else
                            this._performWriteAndInstantiateDoc(id, rev, body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, new Doc(this.db, clone, result)); // written successfully
        });
    }
    
    private _performWrite (id: string, rev: string, body: SimpleObject, callback: ErrResultCallback)
    {
        body['_rev'] = rev;
        this.db.raw.insert(body, id, Err.resultFunc('doc', callback));
    }
    
    destroy (id: string, callback: ErrCallback = ()=>{})
    {
        if (!id)
            callback(Err.missingId('doc'));
        else
            this._destroy(id, callback);
    }
    
    private _destroy (id: string, callback: ErrCallback, tries: number = 0)
    {
        tries++;
        this.head(id, (err, rev) => {
            if (err)
                callback(err);
            else {
                this._performDestroy(id, rev, (err) => {
                    if (err) {
                        if (tries <= this.db.maxTries && err.name == "conflict")
                            this._destroy(id, callback, tries);
                        else
                            callback(err);
                    }
                    else
                        callback(); // successfully destroyed
                });
            }
        });
    }
    
    private _performDestroy (id: string, rev: string, callback: ErrCallback)
    {
        this.db.raw.destroy(id, rev, Err.resultFunc('doc', callback));
    }
    
    head (id: string, callback: ErrHeadCallback = ()=>{})
    {
        if (!id)
            callback(Err.missingId('doc'));
        else
            this._head(id, callback);
    }
    
    private _head (id: string, callback: ErrHeadCallback, tries: number = 0)
    {
        tries++;
        this._performHead(id, (err, rev, result) => {
            if (err) {
                if (tries <= 1 && err.name == "no_db_file") {
                    // create db
                    this.db.create((err) => {
                        if (err && err.name != "db_already_exists")
                            callback(err);
                        else
                            this._head(id, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else
                callback(undefined, rev, result); // success
        });
    }
    
    private _performHead (id: string, callback: ErrHeadCallback)
    {
        // here we need the third parameter
        // not the second
        // the second seems empty...
        this.db.raw.head(id, (raw: any, body: any, result: any) => {
            let err = Err.make('doc', raw);
            if (err)
                callback(err);
            else if (result['etag']) {
                // we have a new rev
                // nano puts it in the format '"etag"' so we need to
                // strip erroneous quotes
                callback(undefined, result['etag'].replace(/"/g, ""), result);
            }
            else
                callback(new Err('doc', "missing_rev", "Rev missing from header response."));
        });
    }
}
