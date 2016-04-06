var mocha  = require('mocha');
var expect = require('chai').expect;
var assert = require('chai').assert;
var deepExtend = require('deep-extend');

var views = {
  "foo" : {
    "map" : "function(doc){ emit(doc._id, doc._rev)}"
  }
};
var dbName = 'nano-records-test';

var NanoRecords = require('../lib/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName, views);

function forceUpdate (doc, data, callback) {
  forced.get(doc.data['_id'], function (err, body) {
    deepExtend(body, data);
    forced.insert(body, callback);
  });
}

describe('nano-records.js', function () {
  before(function (done) {
    nano.db.destroy(dbName, function () { done(); });
  });
  // ok tests start here
  
  it('exists', function () {
    expect(db.nano).to.equal(nano);
    expect(db.dbName).to.equal(dbName);
    expect(db.views).to.eql(views);
    expect(db.db).to.respondTo('insert'); // is a nano instance
  });
  
  describe('documents', function () {
    var docs = [];
    
    it('create a database and document', function (done) {
      db.doc.create({ hello: 'there!' }, function (err, doc) {
        expect(err).to.be.null;
        expect(doc).to.be.ok;
        expect(doc.data).to.have.all.keys('hello', '_id', '_rev');
        docs.push(doc);
        done();
      });
    });
    
    it('create', function (done) {
      db.doc.create({ second: 'document', num: 666 }, function (err, doc) {
        expect(err).to.be.null;
        expect(doc).to.be.ok;
        expect(doc.data).to.have.all.keys('second', 'num', '_id', '_rev');
        docs.push(doc);
        done();
      });
    });
    
    it('update', function (done) {
      var doc = docs[0];
      doc.update({ more: 'attributes' }, function (err, success) {
        expect(err).to.be.null;
        expect(success).to.be.ok;
        expect(doc.data).to.have.all.keys('hello', 'more', '_id', '_rev');
        expect(doc.data['more']).to.equal('attributes');
        done();
      });
    });
    
    it('retrieveLatest', function (done) {
      var doc = docs[1];
      forceUpdate(doc, { anotheranother: "Yay!" }, function (err) {
        expect(err).to.be.null;
        expect(doc.data).to.not.have.keys('anotheranother');
        var oldRev1 = doc.data['_rev'];
        doc.retrieveLatest(function (err, success) {
          expect(err).to.be.null;
          expect(success).to.be.ok;
          expect(doc.data).to.have.all.keys('second', 'num', '_id', '_rev', 'anotheranother');
          expect(doc.data['_rev']).to.not.equal(oldRev1);
          done();
        });
      });
    });
    
    it('recovers from bad update', function (done) {
      var doc = docs[1];
      forceUpdate(doc, { anotheranother: "changed" }, function (err, body) {
        expect(err).to.be.null;
        var oldRev1 = doc.data['_rev'];
        var oldRev2 = body['rev'];
        expect(oldRev1).to.not.equal(oldRev2);
        doc.update({ added: 'attr-again' }, function (err, success) {
          expect(err).to.be.null;
          expect(success).to.be.ok;
          expect(doc.data).to.have.all.keys('second', 'num', '_id', '_rev', 'anotheranother', 'added');
          expect(doc.data['anotheranother']).to.equal('changed');
          expect(doc.data['added']).to.equal('attr-again');
          expect(doc.data['_rev']).to.not.equal(oldRev1);
          expect(doc.data['_rev']).to.not.equal(oldRev2);
          done();
        });
      });
    });
  });
});
