"use strict";

var designs = {
  "foo": {
    "views": {
      "comments": {
        "map": "function (doc) { emit(doc._id, doc); }",
        "reduce": "function (keys, values, rereduce) { return sum(values); }"
      },
      "all-comments": {
        "map": "function (doc) { emit(doc._id, doc); }"
      }
    },
    "shows": {
      "post": "function (doc, req) { return doc ? 'Hello from' + doc._id + '!' : 'Hello world!'; }"
    }
  }
};
var dbName = 'nano-records-db-design-test';

var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName, designs);

var id = "foo";

var assert = require('../../assert/db/design.assert');

describe('db-design', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('view', (done) => {
      assert.view(db, id, "comments", done);
    });
    it('view retries');
    it('view more than maxTries');
    it('show', (done) => {
      assert.show(db, id, "post", "Hello world!", done);
    });
    it('show retries');
    it('show more than maxTries');
    
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('no id specified', () => {
      
      it('view', (done) => {
        assert.view_Fail(db, undefined, "comments", "missing_id", done);
      });
      it('show', (done) => {
        assert.show_Fail(db, undefined, "post", "missing_id", done);
      });
      
    });
    
    describe('document does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/foo", () => { done(); })
      });
      
      describe('definition does not exist', () => {
        
        it('view', (done) => {
          assert.view_Fail(db, id, "does-not-exist", "missing_view", done);
        });
        it('show', (done) => {
          assert.show_Fail(db, id, "does-not-exist", "missing_show", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('view', (done) => {
          assert.view(db, id, "comments", done);
        });
        it('view retries');
        it('view more than maxTries');
        it('show', (done) => {
          assert.show(db, id, "post", "Hello world!", done);
        });
        it('show retries');
        it('show more than maxTries');
        
      });
      
    });
    
    describe('document exists', () => {
      beforeEach((done) => {
        db.doc.write("_design/" + id, {}, (err, doc) => { done(); });
      });
      
      describe('definition does not exist', () => {
        
        it('view', (done) => {
          assert.view_Fail(db, id, "does-not-exist", "missing_view", done);
        });
        it('show', (done) => {
          assert.show_Fail(db, id, "does-not-exist", "missing_show", done);
        });
        
      });
      
      describe('definition exists', () => {
        
        it('view', (done) => {
          assert.view(db, id, "comments", done);
        });
        it('view retries');
        it('view more than maxTries');
        // it('view retries', (done) => {
        //   assert.view_Retries(db, id, "comments", done);
        // });
        // it('view more than maxTries', (done) => {
        //   assert.view_Retries_Fail(db, id, "comments", done);
        // });
        it('show', (done) => {
          assert.show(db, id, "post", "Hello world!", done);
        });
        it('show retries');
        it('show more than maxTries');
        // it('show retries', (done) => {
        //   assert.show_Retries(db, id, "post", "Hello world!", done);
        // });
        // it('show more than maxTries', (done) => {
        //   assert.show_Retries_Fail(db, id, "post", done);
        // });
        
      });
    });
  });
  
});
