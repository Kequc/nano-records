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

function forceUpdate (doc, data, callback) {
  forced.get(doc.body['_id'], (err, body) => {
    deepExtend(body, data);
    forced.insert(body, callback);
  });
}

describe('db-doc', () => {
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      nano.db.destroy(dbName, () => { done(); });
    });
    it('create', (done) => {
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
    });
    it('updateOrCreate', (done) => {
      db.doc.updateOrCreate("fake-id-doesnt-exist", { another: 'one' }, (err, doc) => {
        expect(err).to.be.null;
        expect(doc).to.be.ok;
        expect(doc.body).to.have.all.keys('another', '_id', '_rev');
        expect(doc.getId()).to.equal("fake-id-doesnt-exist");
        db.doc.get(doc.getId(), (err, gotDoc) => {
          expect(err).to.be.null;
          expect(gotDoc).to.be.ok;
          expect(gotDoc.body).to.eql(doc.body);
          done();
        });
      });
    });
  });
  
  describe('database exists', () => {
    before((done) => {
      nano.db.destroy(dbName, () => {
        nano.db.create(dbName, () => { done(); });
      });
    });
    it('create', (done) => {
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
    });
    
    describe('document does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("fake-id-doesnt-exist", () => { done(); })
      });
      it('get', (done) => {
        db.doc.get("fake-id-doesnt-exist", (err, doc) => {
          expect(err).to.be.ok;
          expect(doc).to.be.undefined;
          done();
        });
      });
      it('update', (done) => {
        db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, (err, doc) => {
          expect(err).to.be.ok;
          expect(doc).to.be.undefined;
          done();
        });
      });
      it('updateOrCreate', (done) => {
        db.doc.updateOrCreate("fake-id-doesnt-exist", complexBody, (err, doc) => {
          expect(err).to.be.null;
          expect(doc).to.be.ok;
          expect(doc.body).to.have.all.keys('complex', 'num', 'deep', '_id', '_rev');
          expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
          expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
          expect(doc.getId()).to.equal("fake-id-doesnt-exist");
          done();
        });
      });
      it('destroy', (done) => {
        db.doc.destroy("fake-id-doesnt-exist", (err, doc) => {
          expect(err).to.be.ok;
          expect(doc).to.be.undefined;
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
      it('get', (done) => {
        db.doc.get(_doc.getId(), (err, doc) => {
          expect(err).to.be.null;
          expect(doc).to.be.ok;
          expect(doc.body).to.eql(_doc.body);
          done();
        });
      });
      it('update', (done) => {
        db.doc.update(_doc.getId(), { complex: 'document updated', updated: 'changehere' }, (err) => {
          expect(err).to.be.null;
          _doc.retrieveLatest((err) => {
            expect(err).to.be.null;
            expect(_doc.body).to.have.all.keys('complex', 'num', 'deep', 'updated', '_id', '_rev');
            expect(_doc.body['deep']).to.have.all.keys('hi', 'arr');
            expect(_doc.body['deep']['arr']).to.eql(["some", "values"]);
            db.doc.get(doc._getId(), (err, gotDoc) => {
              expect(err).to.be.null;
              expect(gotDoc).to.be.ok;
              expect(gotDoc.body).to.eql(_doc.body);
              done();
            });
          });
        });
      });
      it('update retries');
      it('update more than maxTimes should fail');
      it('updateOrCreate', (done) => {
        db.doc.updateOrCreate(_doc.getId(), { complex: 'document updated again', updated: 'changed' }, (err) => {
          expect(err).to.be.null;
          _doc.retrieveLatest((err) => {
            expect(err).to.be.null;
            expect(_doc.body).to.have.all.keys('complex', 'num', 'deep', 'updated', '_id', '_rev');
            expect(_doc.body['deep']).to.have.all.keys('hi', 'arr');
            expect(_doc.body['deep']['arr']).to.eql(["some", "values"]);
            expect(_doc.body['complex']).to.equal('document updated again');
            expect(_doc.body['updated']).to.equal('changed');
            done();
          });
        });
      });
      it('updateOrCreate more than maxTimes should fail');
      it('destroy', (done) => {
        let id = _doc.getId()
        db.doc.destroy(id, (err) => {
          expect(err).to.be.null;
          db.doc.get(id, (err, doc) => {
            expect(err).to.be.ok;
            expect(doc).to.be.undefined;
            done();
          });
        });
      });
      it('destroy retries');
      it('destroy more than maxTries should fail');
    });
  });
  
});
