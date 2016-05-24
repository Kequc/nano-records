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
    it('read', (done) => {
      assert.read(db, "foo", "comments", done);
    });
    it('read retries');
    it('read more than maxTries');
    
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('no id specified', () => {
      
      it('read', (done) => {
        assert.read_Fail(db, undefined, "post", "missing_id", done);
      });
      
    });
    
    describe('no results', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/_nano_records", () => { done(); });
      });
        
      it('all', (done) => {
        assert.all(db, "num", {}, [], done);
      });
      it('all with multiple keys', (done) => {
        assert.all(db, ["num", "complex"], {}, [], done);
      });
      it('only', (done) => {
        assert.only(db, "num", "deep", {}, [], done);
      });
      it('only with multiple values', (done) => {
        assert.only(db, "num", ["num", "deep"], {}, [], done);
      });
      it('only with multiple keys and values', (done) => {
        assert.only(db, ["num", "complex"], ["num", "deep"], {}, [], done);
      });
      
    });
    
    describe('results to show', () => {
      let expected = [];
      before((done) => {
        expected = [];
        db.doc.create(Helper.complexBody, (err, doc) => {
          expected.unshift(doc);
          db.doc.create(Helper.simpleBody, (err, doc) => {
            expected.unshift(doc);
            done();
          });
        });
      });
      beforeEach((done) => {
        db.doc.destroy("_design/_nano_records", () => { done(); });
      });
      
      it('all', (done) => {
        assert.all(db, "num", {}, expected, done);
      });
      it('all with multiple keys', (done) => {
        assert.all(db, ["num", "complex"], {}, expected, done);
      });
      it('only', (done) => {
        assert.only(db, "num", "deep", {}, expected, done);
      });
      it('only with multiple values', (done) => {
        assert.only(db, "num", ["num", "deep"], {}, expected, done);
      });
      it('only with multiple keys and values', (done) => {
        assert.only(db, ["num", "complex"], ["num", "deep"], {}, expected, done);
      });
      
    });
    
    describe('design does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/foo", () => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('read', (done) => {
          assert.read_Fail(db, "foo", "does-not-exist", "missing_view", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('read', (done) => {
          assert.read(db, "foo", "comments", done);
        });
        it('read retries');
        it('read more than maxTries');
        
      });
      
    });
    
    describe('design exists', () => {
      before((done) => {
        db.doc.write("_design/foo", {}, () => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('read', (done) => {
          assert.read_Fail(db, "foo", "does-not-exist", "missing_view", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('read', (done) => {
          assert.read(db, "foo", "comments", done);
        });
        it('read retries');
        it('read more than maxTries');
        // it('read retries', (done) => {
        //   assert.read_Retries(db, "foo", "comments", done);
        // });
        // it('read more than maxTries', (done) => {
        //   assert.read_Retries_Fail(db, "foo", "comments", done);
        // });
        
      });
    });
  });
  
});
