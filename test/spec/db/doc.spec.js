"use strict";
var dbName = 'nano-records-db-doc-test';

var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

var assert = require('../../assert/db/doc.assert');
var Util = require('../../assert/util');

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
      assert.read_Fail(db, Util.id, "not_found", done);
    });
    it('head', (done) => {
      assert.head_Fail(db, Util.id, "not_found", done);
    });
    it('write', (done) => {
      assert.write_Fail(db, Util.id, "not_found", done);
    });
    it('forcedWrite', (done) => {
      assert.forcedWrite(db, Util.id, done);
    });
    it('update', (done) => {
      assert.update_Fail(db, Util.id, "not_found", done);
    });
    it('forcedUpdate', (done) => {
      assert.forcedUpdate(db, Util.id, done);
    });
    it('destroy', (done) => {
      assert.destroy_Fail(db, Util.id, "not_found", done);
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
      it('forcedWrite', (done) => {
        assert.forcedWrite_Fail(db, undefined, "missing_id", done);
      });
      it('update', (done) => {
        assert.update_Fail(db, undefined, "missing_id", done);
      });
      it('forcedUpdate', (done) => {
        assert.forcedUpdate_Fail(db, undefined, "missing_id", done);
      });
      it('destroy', (done) => {
        assert.destroy_Fail(db, undefined, "missing_id", done);
      });
      
    });
    
    describe('document does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy(Util.id, () => { done(); });
      });
      
      it('create', (done) => {
        assert.create(db, done);
      });
      it('read', (done) => {
        assert.read_Fail(db, Util.id, "not_found", done);
      });
      it('head', (done) => {
        assert.head_Fail(db, Util.id, "not_found", done);
      });
      it('write', (done) => {
        assert.write_Fail(db, Util.id, "not_found", done);
      });
      it('forcedWrite', (done) => {
        assert.forcedWrite(db, Util.id, done);
      });
      it('update', (done) => {
        assert.update_Fail(db, Util.id, "not_found", done);
      });
      it('forcedUpdate', (done) => {
        assert.forcedUpdate(db, Util.id, done);
      });
      it('destroy', (done) => {
        assert.destroy_Fail(db, Util.id, "not_found", done);
      });
    });
    
    describe('document exists', () => {
      var _doc;
      beforeEach((done) => {
        _doc = undefined;
        db.doc.create(Util.complexBody, (err, doc) => {
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
        it('forcedWrite', (done) => {
          assert.forcedWrite(db, _doc.getId(), done);
        });
        it('update', (done) => {
          assert.update(db, _doc.getId(), done);
        });
        it('forcedUpdate', (done) => {
          assert.forcedUpdate(db, _doc.getId(), done);
        });
        it('destroy', (done) => {
          assert.destroy(db, _doc.getId(), done);
        });
        
      });
      describe('attachment exists', () => {
        beforeEach((done) => {
          _doc.attachment.write(Util.fileName, "This is an example attachment.", "text/plain", () => {
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
        it('forcedWrite', (done) => {
          assert.forcedWrite(db, _doc.getId(), done);
        });
        it('update', (done) => {
          assert.update(db, _doc.getId(), done);
        });
        it('forcedUpdate', (done) => {
          assert.forcedUpdate(db, _doc.getId(), done);
        });
        it('destroy', (done) => {
          assert.destroy(db, _doc.getId(), done);
        });
        
      });
      
    });
  });
  
});
