"use strict";

var dbName = 'nano-records-db-view-test';

var Helper = require('../../helper');
var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName, Helper.designs);

var assert = require('../../assert/db/view.assert');

describe('db-view', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('all', (done) => {
      assert.all(db, "key", {}, [], done);
    });
    it('only', (done) => {
      assert.only(db, "key", "value", {}, [], done);
    });
    it('explicit', (done) => {
      assert.explicit(db, "foo", "comments", done);
    });
    it('explicit retries');
    it('explicit more than maxTries');
    
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('no results', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/_nano_records", () => { done(); });
      });
        
      it('all', (done) => {
        assert.all(db, "num", {}, [], done);
      });
      it('only', (done) => {
        assert.only(db, "num", "deep", {}, [], done);
      });
      
    });
    
    describe('results to show', () => {
      let _docs = [];
      before((done) => {
        _docs = [];
        db.doc.create(Helper.complexBody, (err, doc) => {
          _docs.push(doc);
          db.doc.create(Helper.simpleBody, (err, doc) => {
            _docs.push(doc);
            done();
          });
        });
      });
      beforeEach((done) => {
        db.doc.destroy("_design/_nano_records", () => { done(); });
      });
      
      it('all', (done) => {
        let expected = [Helper.simpleBody, Helper.complexBody];
        assert.all(db, "num", {}, expected, done);
      });
      it('all with lookup', (done) => {
        let expected = [Helper.complexBody];
        assert.all(db, "num", { key: Helper.complexBody.num }, expected, done);
      });
      it('all with multiple keys', (done) => {
        let expected = [Helper.simpleBody, Helper.complexBody];
        assert.all(db, ["num", "complex"], {}, expected, done);
      });
      it('all with multiple keys with lookup', (done) => {
        let expected = [Helper.complexBody];
        assert.all(db, ["num", "complex"], { key: [Helper.complexBody.num, Helper.complexBody.complex] }, expected, done);
      });
      it('all with nested keys', (done) => {
        let expected = [Helper.complexBody];
        assert.all(db, ["num", "deep.hi"], {}, expected, done);
      });
      it('only', (done) => {
        let expected = [{ deep: Helper.simpleBody.deep }, { deep: Helper.complexBody.deep }];
        assert.only(db, "num", "deep", {}, expected, done);
      });
      it('only with lookup', (done) => {
        let expected = [{}];
        assert.only(db, "num", "deep", { key: Helper.simpleBody.num }, expected, done);
      });
      it('only with multiple values', (done) => {
        let expected = [{ num: Helper.simpleBody.num, deep: Helper.simpleBody.deep }, { num: Helper.complexBody.num, deep: Helper.complexBody.deep }];
        assert.only(db, "num", ["num", "deep"], {}, expected, done);
      });
      it('only with nested values', (done) => {
        let expected = [{ num: Helper.complexBody.num, deep: { hi: Helper.complexBody.deep.hi } }];
        assert.only(db, "num", ["num", "deep.hi"], {}, expected, done);
      });
      it('only with multiple keys and values', (done) => {
        let expected = [{ num: Helper.simpleBody.num, deep: Helper.simpleBody.deep }, { num: Helper.complexBody.num, deep: Helper.complexBody.deep }];
        assert.only(db, ["num", "complex"], ["num", "deep"], {}, expected, done);
      });
      it('only with multiple keys and values and lookup', (done) => {
        let expected = [{ num: Helper.simpleBody.num }];
        assert.only(db, ["num", "complex"], ["num", "deep"], { key: [Helper.simpleBody.num, Helper.simpleBody.complex] }, expected, done);
      });
      
    });
    
    describe('design does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/foo", () => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('explicit', (done) => {
          assert.explicit_Fail(db, "foo", "does-not-exist", "missing_view", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('explicit', (done) => {
          assert.explicit(db, "foo", "comments", done);
        });
        it('explicit retries');
        it('explicit more than maxTries');
        
      });
      
    });
    
    describe('design exists', () => {
      before((done) => {
        db.doc.write("_design/foo", {}, () => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('explicit', (done) => {
          assert.explicit_Fail(db, "foo", "does-not-exist", "missing_view", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('explicit', (done) => {
          assert.explicit(db, "foo", "comments", done);
        });
        it('explicit retries');
        it('explicit more than maxTries');
        // it('explicit retries', (done) => {
        //   assert.explicit_Retries(db, "foo", "comments", done);
        // });
        // it('explicit more than maxTries', (done) => {
        //   assert.explicit_Retries_Fail(db, "foo", "comments", done);
        // });
        
      });
    });
  });
  
});
