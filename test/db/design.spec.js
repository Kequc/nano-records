"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

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

var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName, designs);

function forceUpdate (doc, callback) {
  forced.get(doc.getId(), (err, body) => {
    deepExtend(body, { shows: { cats: "function (doc, req) { return 'yo'; }" } });
    forced.insert(body, (err, body) => {
      var oldRev = doc.getRev();
      expect(oldRev).to.be.ok;
      expect(body['rev']).to.be.ok;
      expect(oldRev).to.not.equal(body['rev']);
      callback(err, body);
    });
  });
}

function assertView (done) {
  db.design.view("foo", "comments", {}, (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    expect(data).to.include.keys('rows');
    done();
  });
}

function assertShow (done) {
  db.design.show("foo", "post", "fake-id-doesnt-exist", (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    expect(data).to.equal("Hello world!");
    done();
  });
}

describe('db-design', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('view', (done) => {
      // should be successful
      assertView(done);
    });
    it('show', (done) => {
      // should be successful
      assertShow(done);
    });
    
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('document does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("_design/foo", () => { done(); })
      });
      
      it('view', (done) => {
        // should be successful
        assertView(done);
      });
      it('show', (done) => {
        // should be successful
        assertShow(done);
      });
      
    });
    
    describe('document exists', () => {
      var _doc;
      beforeEach((done) => {
        _doc = undefined;
        db.doc.write("_design/foo", {}, (err, doc) => {
          _doc = doc;
          done();
        });
      });
      
      describe('definition does not exist', () => {
        
        it('view', (done) => {
          // should fail
          db.design.view("foo", "does-not-exist", {}, (err, data) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("missing_view");
            expect(data).to.be.undefined;
            done();
          });
        });
        it('show', (done) => {
          // should fail
          db.design.show("foo", "does-not-exist", "fake-id-doesnt-exist", (err, data) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("missing_show");
            expect(data).to.be.undefined;
            done();
          });
        });
        
      });
      
      describe('definition exists', () => {
        
        it('view', (done) => {
          // should be successful
          assertView(done);
        });
        it('view retries', (done) => {
          // should be successful
          forceUpdate(_doc, () => {
            assertView(done);
          });
        });
        it('show', (done) => {
          // should be successful
          assertShow(done);
        });
        it('show retries', (done) => {
          // should be successful
          forceUpdate(_doc, () => {
            assertShow(done);
          });
        });
        
      });
    });
  });
  
});
