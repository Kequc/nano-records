"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var dbName = 'nano-records-doc-test';

var NanoRecords = require('../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName);

var complexBody = { complex: 'document', num: 11, deep: { hi: "again.", arr: ["some", "values"] } };
var fileName = "attachment-doesnt-exist.txt";

function triggerBgUpdate (doc, data, callback) {
  forced.get(doc.getId(), (err, body) => {
    deepExtend(body, data);
    forced.insert(body, (err, body) => {
      expect(err).to.be.falsy;
      var oldRev = doc.getRev();
      expect(oldRev).to.be.ok;
      expect(body['rev']).to.be.ok;
      expect(oldRev).to.not.equal(body['rev']);
      callback(err, body);
    });
  });
}

function assertBody (doc, asserts, done) {
  for (let key in asserts) {
    if (key != "_rev")
      expect(doc.body[key]).to.eql(asserts[key]);
  }
  expect(asserts['_rev']).to.not.equal(doc.getRev());
  db.doc.read(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.undefined;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
  });
}

function assertHead (doc, done) {
  doc.head((err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    expect(data).to.include.keys('etag');
    done();
  });
}

function assertWrite (doc, done) {
  let changes = { more: "attributes", complex: "Samsonite" };
  let asserts = deepExtend({}, changes);
  expect(doc.body).to.not.include.keys('more');
  expect(doc.body).to.include.keys('num');
  doc.write(changes, (err) => {
    expect(err).to.be.undefined;
    expect(doc.body).to.include.keys('complex', 'more', '_id', '_rev');
    expect(doc.body).to.not.include.keys('num');
    assertBody(doc, asserts, done);
  });
}

function assertUpdate (doc, done, asserts) {
  let changes = { more: "attributes", complex: "Samsonite" };
  asserts = deepExtend({}, asserts || doc.body, changes);
  expect(doc.body).to.not.have.keys('more');
  doc.update(changes, (err) => {
    expect(err).to.be.undefined;
    expect(doc.body).to.include.keys('complex', 'more', '_id', '_rev');
    assertBody(doc, asserts, done);
  });
}

function assertDestroy (doc, done) {
  let id = doc.getId();
  doc.destroy((err) => {
    expect(err).to.be.undefined;
    expect(doc.body).to.eql({});
    db.doc.read(id, (err, gotDoc) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("not_found");
      expect(gotDoc).to.be.undefined;
      done();
    });
  });
}

describe('doc', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('document does not exist', () => {
    var _doc;
    before((done) => {
      _doc = undefined;
      db.doc.write("fake-id-doesnt-exist", complexBody, (err, doc) => {
        _doc = doc;
        doc.destroy(() => { done(); })
      });
    });
    
    it('getId', () => {
      // should fail
      expect(_doc.body['_id']).to.be.undefined;
      expect(_doc.getId()).to.be.undefined;
    });
    it('getRev', () => {
      // should fail
      expect(_doc.body['_rev']).to.be.undefined;
      expect(_doc.getRev()).to.be.undefined;
    });
    it('body', () => {
      // should fail
      expect(_doc.body).to.eql({});
    });
    it('read', (done) => {
      // should fail
      _doc.read((err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        done();
      });
    });
    it('write', (done) => {
      // should fail
      _doc.write({ boo: "oorns" }, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        done();
      });
    });
    it('update', (done) => {
      // should fail
      _doc.update({ boo: "oorns" }, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        done();
      });
    });
    it('head', (done) => {
      // should fail
      _doc.head((err, data) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        expect(data).to.be.undefined;
        done();
      });
    });
    it('destroy', (done) => {
      // should fail
      _doc.destroy((err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
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
        _doc.attachment.write(fileName, "This is an example attachment.", "text/plain", () => {
          _doc.read(() => { done(); });
        });
      });
    });
    
    it('getId', () => {
      // should be successful
      expect(_doc.body['_id']).to.be.ok;
      expect(_doc.getId()).to.equal(_doc.body['_id']);
    });
    it('getRev', () => {
      // should be successful
      expect(_doc.body['_rev']).to.be.ok;
      expect(_doc.getRev()).to.equal(_doc.body['_rev']);
    });
    it('getBody', () => {
      // should be successful
      let copy = _doc.getBody();
      expect(copy).to.include.keys('_id', '_rev', 'complex', 'num', 'deep');
      expect(copy['deep']).to.include.keys('hi', 'arr');
      expect(copy['deep']['arr']).to.eql(["some", "values"]);
      expect(copy['deep']).to.eql(_doc.body['deep']);
      expect(copy['deep']).to.not.equal(_doc.body['deep']);
      expect(copy).to.eql(_doc.body);
      expect(copy).to.not.equal(_doc.body);
    });
    it('read', (done) => {
      // should be successful
      let changes = { anotheranother: "Yay!", complex: "cats and dogs" };
      let asserts = deepExtend({}, _doc.body, changes);
      triggerBgUpdate(_doc, changes, () => {
        expect(_doc.body).to.not.have.keys('anotheranother');
        _doc.read((err) => {
          expect(err).to.be.undefined;
          expect(_doc.body).to.include.keys('complex', 'anotheranother', '_id', '_rev');
          assertBody(_doc, asserts, done);
        });
      });
    });
    it('write', (done) => {
      // should be successful
      assertWrite(_doc, done);
    });
    it('write retries', (done) => {
      // should be successful
      let changes = { anotheranother: "changed" };
      triggerBgUpdate(_doc, changes, () => {
        assertWrite(_doc, done);
      });
    });
    it('write more than maxTries', (done) => {
      // should fail
      triggerBgUpdate(_doc, { a: 'change' }, () => {
        _doc.write({ boo: "oorns" }, (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("conflict");
          done();
        }, db.maxTries); // tried x times
      });
    });
    it('update', (done) => {
      // should be successful
      assertUpdate(_doc, done);
    });
    it('update retries', (done) => {
      // should be successful
      let changes = { anotheranother: "changed" };
      let asserts = deepExtend({}, _doc.body, changes);
      triggerBgUpdate(_doc, changes, () => {
        assertUpdate(_doc, done, asserts);
      });
    });
    it('update more than maxTries', (done) => {
      // should fail
      triggerBgUpdate(_doc, { a: 'change' }, () => {
        _doc.update({ boo: "oorns" }, (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("conflict");
          done();
        }, db.maxTries); // tried x times
      });
    });
    it('head', (done) => {
      // should be successful
      assertHead(_doc, done);
    });
    it('destroy', (done) => {
      // should be successful
      assertDestroy(_doc, done);
    });
    it('destroy retries', (done) => {
      // should be successful
      triggerBgUpdate(_doc, { deleteMe: true }, () => {
        assertDestroy(_doc, done);
      });
    });
    it('destroy more than maxTries', (done) => {
      // should fail
      triggerBgUpdate(_doc, { a: 'change' }, () => {
        _doc.destroy((err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("conflict");
          done();
        }, db.maxTries); // tried x times
      });
    });
  });

});
