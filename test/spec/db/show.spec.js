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
    
    it('catalog', (done) => {
      assert.catalog(db, "foo", "post", "Hello world!", done);
    });
    it('catalog retries');
    it('catalog more than maxTries');
    
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('design does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/foo", () => { done(); })
      });
      
      describe('definition does not exist', () => {
        
        it('catalog', (done) => {
          assert.catalog_Fail(db, "foo", "does-not-exist", "missing_show", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('catalog', (done) => {
          assert.catalog(db, "foo", "post", "Hello world!", done);
        });
        it('catalog retries');
        it('catalog more than maxTries');
        
      });
      
    });
    
    describe('design exists', () => {
      beforeEach((done) => {
        db.doc.write("_design/foo", {}, () => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('catalog', (done) => {
          assert.catalog_Fail(db, "foo", "does-not-exist", "missing_show", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('catalog', (done) => {
          assert.catalog(db, "foo", "post", "Hello world!", done);
        });
        it('catalog retries');
        it('catalog more than maxTries');
        // it('catalog retries', (done) => {
        //   assert.catalog_Retries(db, "foo", "post", "Hello world!", done);
        // });
        // it('catalog more than maxTries', (done) => {
        //   assert.catalog_Retries_Fail(db, "foo", "post", done);
        // });
        
      });
    });
  });
  
});
