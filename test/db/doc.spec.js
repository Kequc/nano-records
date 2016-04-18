"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var dbName = 'nano-records-db-doc-test';

var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName);

var complexBody = { complex: 'document', num: 11, deep: { hi: "again.", arr: ["some", "values"] } };

function assertCreate (done) {
  db.doc.create(complexBody, (err, doc) => {
    expect(err).to.be.null;
    expect(doc).to.be.ok;
    expect(doc.body).to.have.all.keys('complex', 'num', 'deep', '_id', '_rev');
    expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
    expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
    db.doc.get(doc.getId(), (err, gotDoc) => {
      expect(err).to.be.null;
      expect(gotDoc).to.be.ok;
      expect(gotDoc.body).to.eql(doc.body);
      done();
    });
  });
}

function assertGet (doc, done) {
  db.doc.get(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.null;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
  });
}

function assertBody (doc, asserts, done) {
  for (let key in asserts) {
    if (key != "_rev")
      expect(doc.body[key]).to.eql(asserts[key]);
  }
  expect(asserts['_rev']).to.not.equal(doc.getRev());
  db.doc.get(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.null;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
  });
}

function assertUpdateOrCreate (id, done, asserts) {
  let changes = { another: 'one', complex: 'changed' };
  asserts = deepExtend({}, asserts || {}, changes);
  db.doc.updateOrCreate(id, changes, (err, doc) => {
    expect(err).to.be.null;
    expect(doc).to.be.ok;
    expect(doc.body).to.include.keys('another', 'complex', '_id', '_rev');
    expect(doc.getId()).to.equal(id);
    assertBody(doc, asserts, done);
  });
}

function assertUpdate (doc, done) {
  let changes = { complex: 'document updated', updated: 'changehere' };
  let asserts = deepExtend({}, doc.body, changes);
  db.doc.update(doc.getId(), changes, (err) => {
    expect(err).to.be.null;
    doc.retrieveLatest((err) => {
      expect(err).to.be.null;
      expect(doc.body).to.include.keys('complex', 'updated', '_id', '_rev');
      assertBody(doc, asserts, done);
    });
  });
}

function assertDestroy (id, done) {
  db.doc.destroy(id, (err) => {
    expect(err).to.be.null;
    db.doc.get(id, (err, gotDoc) => {
      expect(err).to.be.ok;
      expect(err.reason).to.be.oneOf(['missing', 'deleted']);
      expect(gotDoc).to.be.undefined;
      done();
    });
  });
}

describe('db-doc', () => {
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      nano.db.destroy(dbName, () => { done(); });
    });
    
    it('create', (done) => {
      // should be successful
      assertCreate(done);
    });
    it('get', (done) => {
      // should fail
      db.doc.get("fake-id-doesnt-exist", (err, gotDoc) => {
        expect(err).to.be.ok;
        expect(err.reason).to.be.oneOf(['missing', 'deleted']);
        expect(gotDoc).to.be.undefined;
        done();
      });
    });
    it('update', (done) => {
      // should fail
      db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, (err) => {
        expect(err).to.be.ok;
        expect(err.reason).to.be.oneOf(['missing', 'deleted']);
        done();
      });
    });
    it('updateOrCreate', (done) => {
      // should be successful
      assertUpdateOrCreate("fake-id-doesnt-exist", done);
    });
    it('destroy', (done) => {
      // should fail
      db.doc.destroy("fake-id-doesnt-exist", (err) => {
        expect(err).to.be.ok;
        expect(err.reason).to.be.oneOf(['missing', 'deleted']);
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
      beforeEach((done) => {
        db.doc.destroy("fake-id-doesnt-exist", () => { done(); })
      });
      
      it('create', (done) => {
        // should be successful
        assertCreate(done);
      });
      it('get', (done) => {
        // should fail
        db.doc.get("fake-id-doesnt-exist", (err, doc) => {
          expect(err).to.be.ok;
          expect(err.reason).to.be.oneOf(['missing', 'deleted']);
          expect(doc).to.be.undefined;
          done();
        });
      });
      it('update', (done) => {
        // should fail
        db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, (err) => {
          expect(err).to.be.ok;
          expect(err.reason).to.be.oneOf(['missing', 'deleted']);
          done();
        });
      });
      it('updateOrCreate', (done) => {
        // should be successful
        assertUpdateOrCreate("fake-id-doesnt-exist", done);
      });
      it('destroy', (done) => {
        // should fail
        db.doc.destroy("fake-id-doesnt-exist", (err) => {
          expect(err).to.be.ok;
          expect(err.reason).to.be.oneOf(['missing', 'deleted']);
          done();
        });
      });
    });
    
    describe('document exists', () => {
      var _doc;
      beforeEach((done) => {
        _doc = undefined;
        db.doc.create(complexBody, (err, doc) => {
          _doc = doc;
          done();
        }); 
      });
      
      it('create', (done) => {
        // should be successful
        assertCreate(done);
      });
      it('get', (done) => {
        // should be successful
        assertGet(_doc, done);
      });
      it('update', (done) => {
        // should be successful
        assertUpdate(_doc, done);
      });
      it('updateOrCreate', (done) => {
        // should be successful
        assertUpdateOrCreate(_doc.getId(), done, _doc.body);
      });
      it('destroy', (done) => {
        // should be successful
        assertDestroy(_doc.getId(), done);
      });
      
    });
  });
  
});
