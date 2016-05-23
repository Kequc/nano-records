"use strict";

var dbName = 'nano-records-db-show-test';

var Helper = require('../../helper');
var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName, Helper.designs);

var assert = require('../../assert/db/show.assert');

describe('db-show', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('read', (done) => {
      assert.read(db, "foo", "post", "Hello world!", done);
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
    
    describe('design does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/foo", () => { done(); })
      });
      
      describe('definition does not exist', () => {
        
        it('read', (done) => {
          assert.read_Fail(db, "foo", "does-not-exist", "missing_show", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('read', (done) => {
          assert.read(db, "foo", "post", "Hello world!", done);
        });
        it('read retries');
        it('read more than maxTries');
        
      });
      
    });
    
    describe('design exists', () => {
      beforeEach((done) => {
        db.doc.forcedWrite("_design/foo", {}, () => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('read', (done) => {
          assert.read_Fail(db, "foo", "does-not-exist", "missing_show", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('read', (done) => {
          assert.read(db, "foo", "post", "Hello world!", done);
        });
        it('read retries');
        it('read more than maxTries');
        // it('read retries', (done) => {
        //   assert.read_Retries(db, "foo", "post", "Hello world!", done);
        // });
        // it('read more than maxTries', (done) => {
        //   assert.read_Retries_Fail(db, "foo", "post", done);
        // });
        
      });
    });
  });
  
});
