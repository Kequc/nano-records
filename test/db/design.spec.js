"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var designs = {
  "foo": {
    "views": {
      "comments": {
        "map": "function (doc) { ... };",
        "reduce": "function (keys, values, rereduce) { ... };"
      }
    },
    "shows": {
      "post": "function (doc, req) { ... };"
    }
  }
};
var dbName = 'nano-records-db-design-test';

var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName, designs);

function forceUpdate (doc, data, callback) {
  forced.get(doc.getId(), (err, body) => {
    deepExtend(body, data);
    forced.insert(body, (err, body) => {
      var oldRev = doc.getRev();
      expect(oldRev).to.be.ok;
      expect(body['rev']).to.be.ok;
      expect(oldRev).to.not.equal(body['rev']);
      callback(err, body);
    });
  });
}

describe('db-design', () => {

  describe('database does not exist', () => {
    beforeEach((done) => {
      nano.db.destroy(dbName, () => { done(); });
    });
    
    it('view', (done) => {
      // should be successful
      db.design.view("foo", "comments", {}, (err, data) => {
        // console.log(err);
        // console.log(data);
        done();
      });
    });
    it('show', (done) => {
      // should be successful
      db.design.show("foo", "post", "fake-id-doesnt-exist", (err, data) => {
        // console.log(err);
        // console.log(data);
        done();
      });
    });
  });
  
  describe('database exists', () => {
    before((done) => {
      nano.db.destroy(dbName, () => {
        nano.db.create(dbName, () => { done(); });
      });
    });
    
    describe('document does not exist', () => {
      var _doc;
      before((done) => {
        _doc = undefined;
        db.doc.persist({}, (err, doc) => {
          _doc = doc;
          _doc.erase(() => { done(); })
        });
      });
      
      describe('definition does not exist', () => {
        it('view', (done) => {
          // should fail
          done();
        });
        it('show', (done) => {
          // should fail
          done();
        });
      });
      
      describe('definition exists', () => {
        it('view', (done) => {
          // should be successful
          done();
        });
        it('show', (done) => {
          // should be successful
          done();
        });
      });
    });
    
    describe('document exists', () => {
      var _doc;
      beforeEach((done) => {
        _doc = undefined;
        db.doc.persist({}, (err, doc) => {
          _doc = doc;
          done();
        });
      });
      
      describe('definition does not exist', () => {
        it('view', (done) => {
          // should fail
          done();
        });
        it('show', (done) => {
          // should fail
          done();
        });
      });
      
      describe('definition exists', () => {
        it('view', (done) => {
          // should be successful
          done();
        });
        it('view retries', (done) => {
          // should be successful
          done();
        });
        it('view more than maxTries');
        it('show', (done) => {
          // should be successful
          done();
        });
        it('show retries', (done) => {
          // should be successful
          done();
        });
        it('show more than maxTries');
      });
    });
  });
  
});
