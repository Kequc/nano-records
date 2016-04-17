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
    forced.insert(body, callback);
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
      forceUpdate(_doc, { anotheranother: "Yay!", complex: "cats and dogs" }, (err) => {
        expect(err).to.be.null;
        expect(_doc.body).to.not.have.keys('anotheranother');
        var oldRev = _doc.getRev();
        expect(oldRev).to.be.ok;
        _doc.retrieveLatest((err) => {
          expect(err).to.be.null;
          expect(_doc.body).to.have.all.keys('complex', 'deep', 'num', '_id', '_rev', 'anotheranother');
          expect(_doc.body['anotheranother']).to.equal("Yay!");
          expect(_doc.body['complex']).to.equal("cats and dogs");
          expect(_doc.getRev()).to.be.ok;
          expect(_doc.getRev()).to.not.equal(oldRev);
          done();
        });
      });
    });
    it('update', (done) => {
      // should be successful
      var oldRev = _doc.getRev();
      expect(oldRev).to.be.ok;
      _doc.update({ more: 'attributes', complex: "Samsonite" }, (err) => {
        expect(err).to.be.null;
        expect(_doc.body).to.have.all.keys('complex', 'deep', 'num', '_id', '_rev', 'more');
        expect(_doc.body['more']).to.equal('attributes');
        expect(_doc.body['complex']).to.equal('Samsonite');
        expect(_doc.getRev()).to.be.ok;
        expect(_doc.getRev()).to.not.equal(oldRev);
        done();
      });
    });
    it('update retries', (done) => {
      // should be successful
      forceUpdate(_doc, { anotheranother: "changed" }, (err, body) => {
        expect(err).to.be.null;
        var oldRev_1 = _doc.getRev();
        var oldRev_2 = body['rev'];
        expect(oldRev_1).to.be.ok;
        expect(oldRev_2).to.be.ok;
        expect(oldRev_1).to.not.equal(oldRev_2);
        _doc.update({ added: 'attr-again', num: 20 }, (err) => {
          expect(err).to.be.null;
          expect(_doc.body).to.have.all.keys('complex', 'deep', 'num', '_id', '_rev', 'added', 'anotheranother');
          expect(_doc.body['anotheranother']).to.equal('changed');
          expect(_doc.body['added']).to.equal('attr-again');
          expect(_doc.body['num']).to.equal(20);
          expect(_doc.getRev()).to.be.ok;
          expect(_doc.getRev()).to.not.equal(oldRev_1);
          expect(_doc.getRev()).to.not.equal(oldRev_2);
          done();
        });
      });
    });
    it('update more than maxTimes should fail');
    it('destroy', (done) => {
      // should be successful
      _doc.destroy(function (err) {
        expect(err).to.be.null;
        expect(_doc.body).to.eql({});
        done();
      });
    });
    it('destroy retries', (done) => {
      // should be successful
      forceUpdate(_doc, { deleteMe: true }, (err, body) => {
        var oldRev = _doc.getRev();
        expect(oldRev).to.be.ok;
        expect(body['rev']).to.be.ok;
        expect(oldRev).to.not.equal(body['rev']);
        _doc.destroy((err) => {
          expect(err).to.be.null;
          expect(_doc.body).to.eql({});
          done();
        });
      });
    });
    it('destroy more than maxTries should fail');
  });

});
