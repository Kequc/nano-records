"use strict";
var dbName = 'nano-records-db-doc-test';

var Helper = require('../helper');
var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

var assert = require('../assert/db-doc.assert');

describe('db-doc', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('create', (done) => {
      assert.create(db, done);
    });
    it('read', (done) => {
      assert.read_Fail(db, Helper.id, "not_found", done);
    });
    it('head', (done) => {
      assert.head_Fail(db, Helper.id, "not_found", done);
    });
    it('write', (done) => {
      assert.write(db, Helper.id, done);
    });
    it('update', (done) => {
      assert.update_Fail(db, Helper.id, "not_found", done);
    });
    it('updateOrWrite', (done) => {
      assert.updateOrWrite(db, Helper.id, done);
    });
    it('destroy', (done) => {
      assert.destroy_Fail(db, Helper.id, "not_found", done);
    });
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('no id specified', () => {
      
      it('read', (done) => {
        assert.read_Fail(db, undefined, "missing_id", done);
      });
      it('head', (done) => {
        assert.head_Fail(db, undefined, "missing_id", done);
      });
      it('write', (done) => {
        assert.write_Fail(db, undefined, "missing_id", done);
      });
      it('update', (done) => {
        assert.update_Fail(db, undefined, "missing_id", done);
      });
      it('updateOrWrite', (done) => {
        assert.updateOrWrite_Fail(db, undefined, "missing_id", done);
      });
      it('destroy', (done) => {
        assert.destroy_Fail(db, undefined, "missing_id", done);
      });
      
    });
    
    describe('document does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy(Helper.id, () => { done(); });
      });
      
      it('create', (done) => {
        assert.create(db, done);
      });
      it('read', (done) => {
        assert.read_Fail(db, Helper.id, "not_found", done);
      });
      it('head', (done) => {
        assert.head_Fail(db, Helper.id, "not_found", done);
      });
      it('write', (done) => {
        assert.write(db, Helper.id, done);
      });
      it('update', (done) => {
        assert.update_Fail(db, Helper.id, "not_found", done);
      });
      it('updateOrWrite', (done) => {
        assert.updateOrWrite(db, Helper.id, done);
      });
      it('destroy', (done) => {
        assert.destroy_Fail(db, Helper.id, "not_found", done);
      });
    });
    
    describe('document exists', () => {
      let _doc;
      beforeEach((done) => {
        _doc = undefined;
        db.doc.create(Helper.complexBody, (err, doc) => {
          _doc = doc;
          done();
        }); 
      });
      
      describe('attachment does not exist', () => {
        
        it('read', (done) => {
          assert.read(db, _doc.getId(), done);
        });
        it('head', (done) => {
          assert.head(db, _doc.getId(), done);
        });
        it('write', (done) => {
          assert.write(db, _doc.getId(), done);
        });
        it('write retries');
        it('write more than maxTries');
        it('update', (done) => {
          assert.update(db, _doc.getId(), done);
        });
        it('updateOrWrite', (done) => {
          assert.updateOrWrite(db, _doc.getId(), done);
        });
        it('updateOrWrite retries');
        it('updateOrWrite more than maxTries');
        it('destroy', (done) => {
          assert.destroy(db, _doc.getId(), done);
        });
        it('destroy retries');
        it('destroy more than maxTries');
        
      });
      describe('attachment exists', () => {
        beforeEach((done) => {
          _doc.attachment.write(Helper.fileName, "This is an example attachment.", "text/plain", () => {
            _doc.read(() => { done(); });
          });
        });
        
        it('read', (done) => {
          assert.read(db, _doc.getId(), done);
        });
        it('head', (done) => {
          assert.head(db, _doc.getId(), done);
        });
        it('write', (done) => {
          assert.write(db, _doc.getId(), done);
        });
        it('write retries');
        it('write more than maxTries');
        it('update', (done) => {
          assert.update(db, _doc.getId(), done);
        });
        it('updateOrWrite', (done) => {
          assert.updateOrWrite(db, _doc.getId(), done);
        });
        it('updateOrWrite retries');
        it('updateOrWrite more than maxTries');
        it('destroy', (done) => {
          assert.destroy(db, _doc.getId(), done);
        });
        it('destroy retries');
        it('destroy more than maxTries');
        
      });
      
    });
  });
  
});
