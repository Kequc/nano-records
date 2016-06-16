"use strict";
var dbName = 'nano-records-doc-test';

var Helper = require('../helper');
var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

var assert = require('../assert/doc-attachment.assert');

describe('doc-attachment', () => {
  let _doc;
  beforeEach((done) => {
    _doc = undefined;
    db.doc.create(Helper.simpleBody, (err, doc) => {
      _doc = doc;
      done();
    });
  });
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('document does not exist', () => {
    beforeEach((done) => {
      _doc.attachment.write(Helper.fileName, "Oops!", "text/plain", () => {
        _doc.destroy(() => { done(); })
      });
    });
    
    it('list', () => {
      assert.list(_doc, []);
    });
    it('exists', () => {
      assert.exists(_doc, false);
    });
    it('read', (done) => {
      assert.read_Fail(_doc, "missing_id", done);
    });
    it('createReadStream', (done) => {
      assert.createReadStream_Fail(_doc, "missing_id", done);
    });
    it('write', (done) => {
      assert.write_Fail(_doc, "missing_id", false, done);
    });
    it('createWriteStream', (done) => {
      assert.createWriteStream_Fail(_doc, "missing_id", false, done);
    });
    it('destroy', (done) => {
      assert.destroy_Fail(_doc, "missing_id", false, done);
    });
  });
  
  describe('document exists', () => {
    
    describe('attachment does not exist', () => {
      
      it('list', () => {
        assert.list(_doc, []);
      });
      it('exists', () => {
        assert.exists(_doc, false);
      });
      it('read', (done) => {
        assert.read_Fail(_doc, "not_found", done);
      });
      it('createReadStream', (done) => {
        assert.createReadStream_Fail(_doc, "not_found", done);
      });
      it('write', (done) => {
        assert.write(_doc, done);
      });
      it('write retries', (done) => {
        assert.write_Retries(_doc, done);
      });
      it('write more than maxTries', (done) => {
        assert.write_Retries_Fail(_doc, false, done);
      });
      it('createWriteStream', (done) => {
        assert.createWriteStream(_doc, done);
      });
      it('destroy', (done) => {
        assert.destroy(_doc, done);
      });
      it('destroy retries', (done) => {
        assert.destroy_Retries(_doc, done);
      });
      it('destroy more than maxTries', (done) => {
        assert.destroy_Retries_Fail(_doc, false, done);
      });
    });
    
    describe('attachment exists', () => {
      beforeEach((done) => {
        _doc.attachment.write(Helper.fileName, "This is an example attachment.", "text/plain", () => { done(); });
      });
      
      describe('just persisted', () => {
        
        it('list', () => {
          assert.list(_doc, [Helper.fileName]);
        });
        it('exists', () => {
          assert.exists(_doc, true);
        });
        it('read', (done) => {
          assert.read(_doc, done);
        });
        it('createReadStream', (done) => {
          assert.createReadStream(_doc, done);
        });
        it('write', (done) => {
          assert.write(_doc, done);
        });
        it('write retries', (done) => {
          assert.write_Retries(_doc, done);
        });
        it('write more than maxTries', (done) => {
          assert.write_Retries_Fail(_doc, true, done);
        });
        it('createWriteStream', (done) => {
          assert.createWriteStream(_doc, done);
        });
        it('destroy', (done) => {
          assert.destroy(_doc, done);
        });
        it('destroy retries', (done) => {
          assert.destroy_Retries(_doc, done);
        });
        it('destroy more than maxTries', (done) => {
          assert.destroy_Retries_Fail(_doc, true, done);
        });
        
      });
      describe('aleady read from the database again', () => {
        beforeEach((done) => {
          _doc.read(() => { done(); });
        });
        
        it('list', () => {
          assert.list(_doc, [Helper.fileName]);
        });
        it('exists', () => {
          assert.exists(_doc, true);
        });
        it('write', (done) => {
          assert.write(_doc, done);
        });
        it('write retries', (done) => {
          assert.write_Retries(_doc, done);
        });
        it('write more than maxTries', (done) => {
          assert.write_Retries_Fail(_doc, true, done);
        });
        it('createWriteStream', (done) => {
          assert.createWriteStream(_doc, done);
        });
        it('read', (done) => {
          assert.read(_doc, done);
        });
        it('createReadStream', (done) => {
          assert.createReadStream(_doc, done);
        });
        it('destroy', (done) => {
          assert.destroy(_doc, done);
        });
        it('destroy retries', (done) => {
          assert.destroy_Retries(_doc, done);
        });
        it('destroy more than maxTries', (done) => {
          assert.destroy_Retries_Fail(_doc, true, done);
        });
        
      });
    });
    
  });
});
