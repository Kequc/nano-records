var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var dbName = 'nano-records-db-doc-test';

var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName);

function forceUpdate (doc, data, callback) {
  forced.get(doc.body['_id'], function (err, body) {
    deepExtend(body, data);
    forced.insert(body, callback);
  });
}

describe('db-doc', function () {
  it('create new database', function () {
    // db.doc.create({ hello: 'there!' }, function (err, doc) {
    //   expect(err).to.be.null;
    //   expect(doc).to.be.ok;
    //   expect(doc.body).to.have.all.keys('hello', '_id', '_rev');
    //   docs.push(doc); // store for later
    //   done();
    // });
  });
  it('create', function () {
    // db.doc.create({ second: 'document', num: 666 }, function (err, doc) {
    //   expect(err).to.be.null;
    //   expect(doc).to.be.ok;
    //   expect(doc.body).to.have.all.keys('second', 'num', '_id', '_rev');
    //   docs.push(doc); // store for later
    //   done();
    // });
  });
  it('create complex', function () {
    // db.doc.create({ third: 'document', num: 11, deep: { hi: "again.", arr: ["some", "values"] } }, function (err, doc) {
    //   expect(err).to.be.null;
    //   expect(doc).to.be.ok;
    //   expect(doc.body).to.have.all.keys('third', 'num', 'deep', '_id', '_rev');
    //   expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
    //   expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
    //   docs.push(doc); // store for later
    //   done();
    // });
  });
  it('create does not retry should fail');
  it('get', function () {
    // db.doc.get(docs[0].body['_id'], function (err, doc) {
    //   expect(err).to.be.null;
    //   expect(doc).to.be.ok;
    //   expect(doc.body).to.eql(docs[0].body);
    //   done();
    // });
  });
  it('get does not exist should fail', function () {
    // db.doc.get("fake-id-doesnt-exist", function (err, doc) {
    //   expect(err).to.be.ok;
    //   expect(doc).to.be.undefined;
    //   done();
    // });
  });
  it('update', function () {
    // var doc = docs[2];
    // db.doc.update(docs[2].body['_id'], { updated: 'changehere' }, function (err) {
    //   expect(err).to.be.null;
    //   doc.retrieveLatest(function (err) {
    //     expect(err).to.be.null;
    //     expect(doc.body).to.have.all.keys('third', 'num', 'deep', 'updated', '_id', '_rev');
    //     expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
    //     expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
    //     expect(doc.body['updated']).to.equal('changehere');
    //     done();
    //   });
    // });
  });
  it('update retries');
  it('update more than maxTimes should fail');
  it('update does not exist should fail', function () {
    // db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, function (err, doc) {
    //   expect(err).to.be.ok;
    //   expect(doc).to.be.undefined;
    //   done();
    // });
  });
  it('destroy', function () {
    // db.doc.create({ temp: 'document', num: 1011 }, function (err, doc) {
    //   expect(err).to.be.null;
    //   expect(doc).to.be.ok;
    //   db.doc.destroy(doc.body['_id'], function (err) {
    //     expect(err).to.be.null;
    //     done();
    //   });
    // });
  });
  it('destroy retries');
  it('destroy more than maxTries should fail');
  it('destroy does not exist should fail', function () {
    // db.doc.destroy("fake-id-doesnt-exist", function (err, doc) {
    //   expect(err).to.be.ok;
    //   expect(doc).to.be.undefined;
    //   done();
    // });
  });
});
