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
var docs = [];

var NanoRecords = require('../lib/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName, views);

function forceUpdate (doc, data, callback) {
  forced.get(doc.body['_id'], function (err, body) {
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
  
  it('docCreate a database and document', function (done) {
    db.doc.create({ hello: 'there!' }, function (err, doc) {
      expect(err).to.be.null;
      expect(doc).to.be.ok;
      expect(doc.body).to.have.all.keys('hello', '_id', '_rev');
      docs.push(doc); // store for later
      done();
    });
  });
  
  it('docCreate', function (done) {
    db.doc.create({ second: 'document', num: 666 }, function (err, doc) {
      expect(err).to.be.null;
      expect(doc).to.be.ok;
      expect(doc.body).to.have.all.keys('second', 'num', '_id', '_rev');
      docs.push(doc); // store for later
      done();
    });
  });
  
  it('complex docCreate', function (done) {
    db.doc.create({ third: 'document', num: 11, deep: { hi: "again.", arr: ["some", "values"] } }, function (err, doc) {
      expect(err).to.be.null;
      expect(doc).to.be.ok;
      expect(doc.body).to.have.all.keys('third', 'num', 'deep', '_id', '_rev');
      expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
      expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
      docs.push(doc); // store for later
      done();
    });
  });
  
  describe('document', function () {
    var destroyedDoc;
    
    it('update', function (done) {
      var doc = docs[0];
      doc.update({ more: 'attributes' }, function (err, success) {
        expect(err).to.be.null;
        expect(success).to.be.ok;
        expect(doc.body).to.have.all.keys('hello', 'more', '_id', '_rev');
        expect(doc.body['more']).to.equal('attributes');
        done();
      });
    });
    
    it('retrieveLatest', function (done) {
      var doc = docs[1];
      forceUpdate(doc, { anotheranother: "Yay!" }, function (err) {
        expect(err).to.be.null;
        expect(doc.body).to.not.have.keys('anotheranother');
        var oldRev1 = doc.body['_rev'];
        doc.retrieveLatest(function (err, success) {
          expect(err).to.be.null;
          expect(success).to.be.ok;
          expect(doc.body).to.have.all.keys('second', 'num', '_id', '_rev', 'anotheranother');
          expect(doc.body['_rev']).to.not.equal(oldRev1);
          done();
        });
      });
    });
    
    it('recovers from bad update', function (done) {
      var doc = docs[1];
      forceUpdate(doc, { anotheranother: "changed" }, function (err, body) {
        expect(err).to.be.null;
        var oldRev1 = doc.body['_rev'];
        var oldRev2 = body['rev'];
        expect(oldRev1).to.not.equal(oldRev2);
        doc.update({ added: 'attr-again' }, function (err, success) {
          expect(err).to.be.null;
          expect(success).to.be.ok;
          expect(doc.body).to.have.all.keys('second', 'num', '_id', '_rev', 'anotheranother', 'added');
          expect(doc.body['anotheranother']).to.equal('changed');
          expect(doc.body['added']).to.equal('attr-again');
          expect(doc.body['_rev']).to.not.equal(oldRev1);
          expect(doc.body['_rev']).to.not.equal(oldRev2);
          done();
        });
      });
    });
    
    it('destroy', function (done) {
      db.doc.create({ temp: 'document', num: 96 }, function (err, doc) {
        expect(err).to.be.null;
        expect(doc).to.be.ok;
        expect(doc.body).to.have.all.keys('temp', 'num', '_id', '_rev');
        destroyedDoc = doc; // store for later
        doc.destroy(function (err, success) {
          expect(err).to.be.null;
          expect(success).to.be.ok;
          expect(doc.body).to.eql({});
          done();
        });
      });
    });
    
    it('update destroyed doc should fail', function (done) {
      destroyedDoc.update({ boo: "oorns" }, function (err, success) {
        expect(err).to.be.ok;
        expect(success).to.be.undefined;
        done();
      });
    });
    
    it('retrieveLatest destroyed doc should fail', function (done) {
      destroyedDoc.retrieveLatest(function (err, success) {
        expect(err).to.be.ok;
        expect(success).to.be.undefined;
        done();
      });
    });
    
    it('destroy destroyed doc should fail', function (done) {
      destroyedDoc.destroy(function (err, success) {
        expect(err).to.be.ok;
        expect(success).to.be.undefined;
        done();
      });
    });
    
    // TODO: Attachment tests
  });
  
  it('docGet', function (done) {
    db.doc.get(docs[0].body['_id'], function (err, doc) {
      expect(err).to.be.null;
      expect(doc).to.be.ok;
      expect(doc.body).to.eql(docs[0].body);
      done();
    });
  });
  
  it('missing docGet', function (done) {
    db.doc.get("fake-id-doesnt-exist", function (err, doc) {
      expect(err).to.be.ok;
      expect(doc).to.be.undefined;
      done();
    });
  });
  
  it('docUpdate', function (done) {
    var doc = docs[2];
    db.doc.update(docs[2].body['_id'], { updated: 'changehere' }, function (err, success) {
      expect(err).to.be.null;
      expect(success).to.be.ok;
      doc.retrieveLatest(function (err) {
        expect(err).to.be.null;
        expect(doc.body).to.have.all.keys('third', 'num', 'deep', 'updated', '_id', '_rev');
        expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
        expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
        expect(doc.body['updated']).to.equal('changehere');
        done();
      });
    });
  });
  
  it('missing docUpdate', function (done) {
    db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, function (err, doc) {
      expect(err).to.be.ok;
      expect(doc).to.be.undefined;
      done();
    });
  });
  
  it('docDestroy', function (done) {
    db.doc.create({ temp: 'document', num: 1011 }, function (err, doc) {
      expect(err).to.be.null;
      expect(doc).to.be.ok;
      db.doc.destroy(doc.body['_id'], function (err, success) {
        expect(err).to.be.null;
        expect(success).to.be.ok;
        done();
      });
    });
  });
  
  it('missing docDestroy', function (done) {
    db.doc.destroy("fake-id-doesnt-exist", function (err, doc) {
      expect(err).to.be.ok;
      expect(doc).to.be.undefined;
      done();
    });
  });
  
});
