/* class Doc
 * 
 * Manages a single instance of a single document in the database.
 * Methods called within this class do not take an `_id` parameter
 * and in general will stop working if the document no longer has
 * one. Ie. If the record was deleted.
 * 
 * All methods assume that a database exists.
 * 
 */

import {default as Err, ErrCallback, ErrResultCallback, ErrHeadCallback} from './err';
import {default as Db} from './db';
import {default as DocAttachment} from './doc-attachment';
import deepExtend = require('deep-extend');

export interface ErrDocCallback {
    (err?: Err, doc?: Doc): any;
}

export default class Doc
{
    body: SimpleObject = {};
    _latestRev: string;
    
    db: Db;
    attachment: DocAttachment;
    
    constructor (db: Db, body: SimpleObject = {}, result: SimpleObject = {})
    {
        this.db = db;
        this.attachment = new DocAttachment(this);

        deepExtend(this.body, body);
        this.body['_id'] = result['id'] || this.body['_id'];
        this.body['_rev'] = this._latestRev = result['rev'] || this.body['_rev'];
    }
    
    read (callback: ErrCallback = ()=>{})
    {
        if (!this.getId())
            callback(Err.missingId('doc'));
        else
            this._read(callback);
    }
    
    private _read (callback: ErrCallback)
    {
        this._performRead((err, result) => {
            if (err)
                callback(err);
            else {
                this.body = result;
                this._latestRev = result['_rev'];
                callback(); // up to date
            }
        });
    }
    
    private _performRead (callback: ErrResultCallback)
    {
        this.db.raw.get(this.getId(), Err.resultFunc('doc', callback));
    }
    
    write (body: SimpleObject, callback: ErrCallback = ()=>{})
    {
        if (!this.getId())
            callback(Err.missingId('doc'));
        else if (!body)
            callback(Err.missingParam('doc', "body"));
        else
            this._write(body, callback);
    }
    
    private _write (body: SimpleObject, callback: ErrCallback, tries: number = 0)
    {
        tries++;
        let clone = deepExtend({}, body);
        this._performWrite(clone, (err, result) => {
            if (err) {
                if (tries <= this.db.maxTries && err.name == "conflict") {
                    this.head((err) => {
                        if (err)
                            callback(err);
                        else
                            this._write(body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                this.body = clone;
                this.body['_id'] = result['id'];
                this.body['_rev'] = this._latestRev = result['rev'];
                callback(); // success
            }
        });
    }
    
    private _performWrite (body: SimpleObject, callback: ErrResultCallback)
    {
        body['_rev'] = this._latestRev;
        this.db.raw.insert(body, this.getId(), Err.resultFunc('doc', callback));
    }
    
    update (body: SimpleObject, callback: ErrCallback = ()=>{})
    {
        if (!this.getId())
            callback(Err.missingId('doc'));
        else if (!body)
            callback(Err.missingParam('doc', "body"));
        else
            this._update(body, callback);
    }
    
    private _update (body: SimpleObject, callback: ErrCallback, tries: number = 0)
    {
        tries++;
        let clone = deepExtend({}, this.body, body);
        this._performUpdate(clone, (err, result) => {
            if (err) {
                if (tries <= this.db.maxTries && err.name == "conflict") {
                    this.read((err) => {
                        if (err)
                            callback(err);
                        else
                            this._update(body, callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                this.body = clone;
                this.body['_id'] = result['id'];
                this.body['_rev'] = this._latestRev = result['rev'];
                callback(); // success
            }
        });
    }
    
    private _performUpdate (body: SimpleObject, callback: ErrResultCallback)
    {
        if (this.getRev() !== this._latestRev)
            callback(Err.conflict('doc')); // we know we are out of date
        else
            this.db.raw.insert(body, this.getId(), Err.resultFunc('doc', callback));
    }
    
    destroy (callback: ErrCallback = ()=>{})
    {
        if (!this.getId())
            callback(Err.missingId('doc'));
        else
            this._destroy(callback);
    }
    
    private _destroy (callback: ErrCallback, tries: number = 0)
    {
        tries++;
        this._performDestroy((err) => {
            if (err) {
                if (tries <= this.db.maxTries && err.name == "conflict") {
                    this.head((err) => {
                        if (err)
                            callback(err);
                        else
                            this._destroy(callback, tries);
                    });
                }
                else
                    callback(err);
            }
            else {
                this.body = {};
                callback(); // success
            }
        });
    }
    
    private _performDestroy (callback: ErrCallback)
    {
        this.db.raw.destroy(this.getId(), this._latestRev, Err.resultFunc('doc', callback));
    }
    
    head (callback: ErrHeadCallback = ()=>{})
    {
        if (!this.getId())
            callback(Err.missingId('doc'));
        else
            this._head(callback);
    }
    
    private _head (callback: ErrHeadCallback)
    {
        // we have a method already available for this on the db object
        this.db.doc.head(this.getId(), (err, rev, result) => {
            if (rev)
                this._latestRev = rev;
            callback(err, rev, result);
        });
    }
    
    getId (): string
    {
        return this.body['_id'];
    }
    
    getRev (): string
    {
        return this.body['_rev'];
    }
    
    getBody (): SimpleObject
    {
        return deepExtend({}, this.body);
    }
}
