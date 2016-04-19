"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;

var dbName = 'nano-records-db-doc-attachment-test';

var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

var fileName = "attachment-doesnt-exist.txt";

function streamToString (stream, callback) {
  var chunks = [];
  stream.on('data', (chunk) => {
    chunks.push(chunk);
  });
  stream.on('end', () => {
    if (callback)
      callback(chunks.join(''));
  });
}

function assertPersist (doc, done) {
  db.doc.attachment.persist(doc.getId(), fileName, "Can persist here.", "text/plain", (err) => {
    expect(err).to.be.undefined;
    doc.retrieveLatest((err) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(fileName)).to.be.true;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

function assertGet (doc, done) {
  db.doc.attachment.get(doc.getId(), fileName, (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    expect(doc.getId()).to.be.ok;
    done();
  });
}

function assertRead (doc, done) {
  streamToString(db.doc.attachment.read(doc.getId(), fileName, (err) => {
    expect(err).to.be.undefined;
    done();
  }), (result) => {
    expect(result).to.equal('This is an example attachment.');
  });
}

function assertErase (doc, done) {
  db.doc.attachment.erase(doc.getId(), fileName, (err) => {
    expect(err).to.be.undefined;
    doc.retrieveLatest((err) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(fileName)).to.be.false;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

describe('db-doc-attachment', () => {
  after((done) => {
    nano.db.destroy(dbName, () => { done(); });
  });

  describe('database does not exist', () => {
    beforeEach((done) => {
      nano.db.destroy(dbName, () => { done(); });
    });
    
    it('persist', (done) => {
      // should fail
      db.doc.attachment.persist("fake-id-doesnt-exist", fileName, "Cannot add here.", "text/plain", (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        done();
      });
    });
    it('get', (done) => {
      // should fail
      db.doc.attachment.get("fake-id-doesnt-exist", fileName, (err, data) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        expect(data).to.be.undefined;
        done();
      });
    });
    it('read', (done) => {
      // should fail
      streamToString(db.doc.attachment.read("fake-id-doesnt-exist", fileName, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        done();
      }));
    });
    it('erase', (done) => {
      // should fail
      db.doc.attachment.erase("fake-id-doesnt-exist", fileName, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
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
        db.doc.erase("fake-id-doesnt-exist", () => { done(); })
      });
      
      it('persist', (done) => {
        // should fail
        db.doc.attachment.persist("fake-id-doesnt-exist", fileName, "Cannot add here.", "text/plain", (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          done();
        });
      });
      it('get', (done) => {
        // should fail
        db.doc.attachment.get("fake-id-doesnt-exist", fileName, (err, data) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          expect(data).to.be.undefined;
          done();
        });
      });
      it('read', (done) => {
        // should fail
        streamToString(db.doc.attachment.read("fake-id-doesnt-exist", fileName, (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          done();
        }));
      });
      it('erase', (done) => {
        // should fail
        db.doc.attachment.erase("fake-id-doesnt-exist", fileName, (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          done();
        });
      });
      
    });
    
    describe('document exists', () => {
      var _doc;
      before((done) => {
        _doc = undefined;
        db.doc.persist({ hi: "there" }, (err, doc) => {
          _doc = doc;
          done();
        });
      });
      
      describe('attachment does not exist', () => {
        beforeEach((done) => {
          _doc.attachment.erase(fileName, () => { done(); });
        });
        
        it('persist', (done) => {
          // should be successful
          assertPersist(_doc, done);
        });
        it('get', (done) => {
          // should fail
          db.doc.attachment.get(_doc.getId(), fileName, (err, data) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("not_found");
            expect(data).to.be.undefined;
            expect(_doc.getId()).to.be.ok;
            done();
          });
        });
        it('read', (done) => {
          // should fail
          streamToString(db.doc.attachment.read(_doc.getId(), fileName, (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("not_found");
            expect(_doc.getId()).to.be.ok;
            done();
          }));
        });
        it('erase', (done) => {
          // should be successful
          assertErase(_doc, done);
        });
        
      });
      describe('attachment exists', () => {
        beforeEach((done) => {
          _doc.attachment.persist(fileName, "This is an example attachment.", "text/plain", (err) => { done(); });
        });
        
        it('persist', (done) => {
          // should be successful
          assertPersist(_doc, done);
        });
        it('get', (done) => {
          // should be successful
          assertGet(_doc, done);
        });
        it('read', (done) => {
          // should be successful
          assertRead(_doc, done);
        });
        it('erase', (done) => {
          // should be successful
          assertErase(_doc, done);
        });
        
      });
      
    });
    
  });
});
