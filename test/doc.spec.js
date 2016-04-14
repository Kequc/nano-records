var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var dbName = 'nano-records-doc-test';

var NanoRecords = require('../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName);

function forceUpdate (doc, data, callback) {
  forced.get(doc.body['_id'], function (err, body) {
    deepExtend(body, data);
    forced.insert(body, callback);
  });
}

describe('doc', function () {
  it('creates a new doc object');
  it('creates a new doc object with parameters');
  it('creates a new doc object with a id', function () {
    // var doc = docs[0];
    // expect(doc.body['_id']).to.be.ok;
    // expect(doc.getId()).to.equal(doc.body['_id']);
  });
  it('creates a new doc object with a revision', function () {
    // var doc = docs[0];
    // expect(doc.body['_rev']).to.be.ok;
    // expect(doc.getRev()).to.equal(doc.body['_rev']);
  });
  it('retrieveLatest', function () {
    // var doc = docs[1];
    // forceUpdate(doc, { anotheranother: "Yay!" }, function (err) {
    //   expect(err).to.be.null;
    //   expect(doc.body).to.not.have.keys('anotheranother');
    //   var oldRev1 = doc.body['_rev'];
    //   doc.retrieveLatest(function (err) {
    //     expect(err).to.be.null;
    //     expect(doc.body).to.have.all.keys('second', 'num', '_id', '_rev', 'anotheranother');
    //     expect(doc.body['_rev']).to.not.equal(oldRev1);
    //     done();
    //   });
    // });
  });
  it('retrieveLatest does not exist should fail', function () {
    // destroyedDoc.retrieveLatest(function (err) {
    //   expect(err).to.be.ok;
    //   done();
    // });
  });
  it('update', function () {
    // var doc = docs[0];
    // doc.update({ more: 'attributes' }, function (err) {
    //   expect(err).to.be.null;
    //   expect(doc.body).to.have.all.keys('hello', 'more', '_id', '_rev');
    //   expect(doc.body['more']).to.equal('attributes');
    //   done();
    // });
  });
  it('update retries', function () {
    // var doc = docs[1];
    // forceUpdate(doc, { anotheranother: "changed" }, function (err, body) {
    //   expect(err).to.be.null;
    //   var oldRev1 = doc.body['_rev'];
    //   var oldRev2 = body['rev'];
    //   expect(oldRev1).to.not.equal(oldRev2);
    //   doc.update({ added: 'attr-again' }, function (err) {
    //     expect(err).to.be.null;
    //     expect(doc.body).to.have.all.keys('second', 'num', '_id', '_rev', 'anotheranother', 'added');
    //     expect(doc.body['anotheranother']).to.equal('changed');
    //     expect(doc.body['added']).to.equal('attr-again');
    //     expect(doc.body['_rev']).to.not.equal(oldRev1);
    //     expect(doc.body['_rev']).to.not.equal(oldRev2);
    //     done();
    //   });
    // });
  });
  it('update more than maxTimes should fail');
  it('update does not exist should fail', function () {
    // destroyedDoc.update({ boo: "oorns" }, function (err) {
    //   expect(err).to.be.ok;
    //   done();
    // });
  });
  it('destroy', function () {
    // db.doc.create({ temp: 'document', num: 96 }, function (err, doc) {
    //   expect(err).to.be.null;
    //   expect(doc).to.be.ok;
    //   expect(doc.body).to.have.all.keys('temp', 'num', '_id', '_rev');
    //   destroyedDoc = doc; // store for later
    //   doc.destroy(function (err) {
    //     expect(err).to.be.null;
    //     expect(doc.body).to.eql({});
    //     done();
    //   });
    // });
  });
  it('destroy retries');
  it('destroy more than maxTries should fail');
  it('destroy does not exist should fail', function () {
    // destroyedDoc.destroy(function (err) {
    //   expect(err).to.be.ok;
    //   done();
    // });
  });
});
