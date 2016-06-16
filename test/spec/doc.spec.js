"use strict";
var dbName = 'nano-records-doc-test';

var Helper = require('../helper');
var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

var assert = require('../assert/doc.assert');

describe('doc', () => {
    let _doc;
    beforeEach((done) => {
        _doc = undefined;
        db.doc.create(Helper.complexBody, (err, doc) => {
            _doc = doc;
            done();
        });
    });
    after((done) => {
        db.destroy('_DESTROY_', () => { done(); });
    });
    
    describe('document does not exist', () => {
        beforeEach((done) => {
            _doc.destroy(() => { done(); })
        });
        
        it('getId', () => {
            assert.getId_Fail(_doc);
        });
        it('getRev', () => {
            assert.getRev_Fail(_doc);
        });
        it('body', () => {
            assert.getBody_Fail(_doc);
        });
        it('read', (done) => {
            assert.read_Fail(_doc, "missing_id", done);
        });
        it('write', (done) => {
            assert.write_Fail(_doc, "missing_id", done);
        });
        it('update', (done) => {
            assert.update_Fail(_doc, "missing_id", done);
        });
        it('head', (done) => {
            assert.head_Fail(_doc, "missing_id", done);
        });
        it('destroy', (done) => {
            assert.destroy_Fail(_doc, "missing_id", done);
        });
    });
    
    describe('document exists', () => {
        
        describe('attachment does not exist', () => {
            
            it('getId', () => {
                assert.getId(_doc);
            });
            it('getRev', () => {
                assert.getRev(_doc);
            });
            it('getBody', () => {
                assert.getBody(_doc);
            });
            it('read', (done) => {
                assert.read(_doc, done);
            });
            it('write', (done) => {
                assert.write(_doc, done);
            });
            it('write retries', (done) => {
                assert.write_Retries(_doc, done);
            });
            it('write more than maxTries', (done) => {
                assert.write_Retries_Fail(_doc, done);
            });
            it('update', (done) => {
                assert.update(_doc, done);
            });
            it('update retries', (done) => {
                assert.update_Retries(_doc, done);
            });
            it('update more than maxTries', (done) => {
                assert.update_Retries_Fail(_doc, done);
            });
            it('head', (done) => {
                assert.head(_doc, done);
            });
            it('destroy', (done) => {
                assert.destroy(_doc, done);
            });
            it('destroy retries', (done) => {
                assert.destroy_Retries(_doc, done);
            });
            it('destroy more than maxTries', (done) => {
                assert.destroy_Retries_Fail(_doc, done);
            });
            
        });
        describe('attachment exists', () => {
            beforeEach((done) => {
                _doc.attachment.write(Helper.fileName, "This is an example attachment.", "text/plain", () => { done(); });
            });
            
            describe('just persisted', () => {
                
                it('getBody', () => {
                    assert.getBody(_doc);
                });
                it('read', (done) => {
                    assert.read(_doc, done);
                });
                it('write', (done) => {
                    assert.write(_doc, done);
                });
                it('write retries', (done) => {
                    assert.write_Retries(_doc, done);
                });
                it('write more than maxTries', (done) => {
                    assert.write_Retries_Fail(_doc, done);
                });
                it('update', (done) => {
                    assert.update(_doc, done);
                });
                it('update retries', (done) => {
                    assert.update_Retries(_doc, done);
                });
                it('update more than maxTries', (done) => {
                    assert.update_Retries_Fail(_doc, done);
                });
                it('head', (done) => {
                    assert.head(_doc, done);
                });
                it('destroy', (done) => {
                    assert.destroy(_doc, done);
                });
                it('destroy retries', (done) => {
                    assert.destroy_Retries(_doc, done);
                });
                it('destroy more than maxTries', (done) => {
                    assert.destroy_Retries_Fail(_doc, done);
                });
                
            });
            describe('aleady read from the database again', () => {
                beforeEach((done) => {
                    _doc.read(() => { done(); });
                });
                
                it('getBody', () => {
                    assert.getBody(_doc);
                });
                it('read', (done) => {
                    assert.read(_doc, done);
                });
                it('write', (done) => {
                    assert.write(_doc, done);
                });
                it('write retries', (done) => {
                    assert.write_Retries(_doc, done);
                });
                it('write more than maxTries', (done) => {
                    assert.write_Retries_Fail(_doc, done);
                });
                it('update', (done) => {
                    assert.update(_doc, done);
                });
                it('update retries', (done) => {
                    assert.update_Retries(_doc, done);
                });
                it('update more than maxTries', (done) => {
                    assert.update_Retries_Fail(_doc, done);
                });
                it('head', (done) => {
                    assert.head(_doc, done);
                });
                it('destroy', (done) => {
                    assert.destroy(_doc, done);
                });
                it('destroy retries', (done) => {
                    assert.destroy_Retries(_doc, done);
                });
                it('destroy more than maxTries', (done) => {
                    assert.destroy_Retries_Fail(_doc, done);
                });
                                
            });
            
        });
        
    });

});
