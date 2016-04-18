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

function forceUpdate (doc, data, callback) {
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
  db.doc.get(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.null;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
  });
}

describe('doc', () => {
  
  describe('document does not exist', () => {
    var _doc;
    before((done) => {
      _doc = undefined;
      db.doc.updateOrCreate("fake-id-doesnt-exist", complexBody, (err, doc) => {
        _doc = doc;
        doc.destroy(() => { done(); })
      });
    });
    
    it('getId', () => {
      // should fail
      expect(_doc.body['_id']).to.be.undefined;
      expect(_doc.getId()).to.be.null;
    });
    it('getRev', () => {
      // should fail
      expect(_doc.body['_rev']).to.be.undefined;
      expect(_doc.getRev()).to.be.null;
    });
    it('retrieveLatest', (done) => {
      // should fail
      _doc.retrieveLatest((err) => {
        expect(err).to.be.ok;
        done();
      });
    });
    it('update', (done) => {
      // should fail
      _doc.update({ boo: "oorns" }, (err) => {
        expect(err).to.be.ok;
        done();
      });
    });
    it('destroy', (done) => {
      // should fail
      _doc.destroy((err) => {
        expect(err).to.be.ok;
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
    it('retrieveLatest', (done) => {
      // should be successful
      let changes = { anotheranother: "Yay!", complex: "cats and dogs" };
      forceUpdate(_doc, changes, () => {
        let asserts = deepExtend({}, _doc.body, changes);
        expect(_doc.body).to.not.have.keys('anotheranother');
        _doc.retrieveLatest((err) => {
          expect(err).to.be.null;
          expect(_doc.body).to.include.keys('complex', 'anotheranother', '_id', '_rev');
          assertBody(_doc, asserts, done);
        });
      });
    });
    it('update', (done) => {
      // should be successful
      let changes = { more: "attributes", complex: "Samsonite" };
      let asserts = deepExtend({}, _doc.body, changes);
      expect(_doc.body).to.not.have.keys('more');
      _doc.update(changes, (err) => {
        expect(err).to.be.null;
        expect(_doc.body).to.include.keys('complex', 'more', '_id', '_rev');
        assertBody(_doc, asserts, done);
      });
    });
    it('update retries', (done) => {
      // should be successful
      let changes1 = { anotheranother: "changed" };
      let changes2 = { added: "attr-again", num: 20 };
      forceUpdate(_doc, changes1, () => {
        let asserts = deepExtend({}, _doc.body, changes1, changes2);
        expect(_doc.body).to.not.have.keys('anotheranother', 'added');
        _doc.update(changes2, (err) => {
          expect(err).to.be.null;
          expect(_doc.body).to.include.keys('added', 'anotheranother', 'num', '_id', '_rev');
          assertBody(_doc, asserts, done);
        });
      });
    });
    it('update more than maxTimes should fail');
    it('destroy', (done) => {
      // should be successful
      let id = _doc.getId();
      _doc.destroy(function (err) {
        expect(err).to.be.null;
        expect(_doc.body).to.eql({});
        db.doc.get(id, (err, gotDoc) => {
          expect(err).to.be.ok;
          expect(err.reason).to.be.oneOf(['missing', 'deleted']);
          expect(gotDoc).to.be.undefined;
          done();
        });
      });
    });
    it('destroy retries', (done) => {
      // should be successful
      forceUpdate(_doc, { deleteMe: true }, () => {
        let id = _doc.getId();
        _doc.destroy((err) => {
          expect(err).to.be.null;
          expect(_doc.body).to.eql({});
          db.doc.get(id, (err, gotDoc) => {
            expect(err).to.be.ok;
            expect(err.reason).to.be.oneOf(['missing', 'deleted']);
            expect(gotDoc).to.be.undefined;
            done();
          });
        });
      });
    });
    it('destroy more than maxTries should fail');
  });

});
