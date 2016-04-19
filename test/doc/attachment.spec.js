"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');
var fs = require('fs');

var dbName = 'nano-records-doc-attachment-test';

var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName);

var fileName = "attachment-doesnt-exist.txt";

function forceUpdate (doc, data, callback) {
  forced.get(doc.getId(), (err, body) => {
    deepExtend(body, data);
    forced.insert(body, (err, body) => {
      var oldRev = doc.getRev();
      expect(oldRev).to.be.ok;
      expect(body['rev']).to.be.ok;
      expect(oldRev).to.not.equal(body['rev']);
      callback(err, body);
    });
  });
}

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
  doc.attachment.persist(fileName, "Can persist here.", "text/plain", (err) => {
    expect(err).to.be.null;
    expect(doc.attachment.exists(fileName)).to.be.true;
    doc.retrieveLatest((err) => {
      expect(err).to.be.null;
      expect(doc.attachment.exists(fileName)).to.be.true;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

function assertWrite (doc, done) {
  fs.createReadStream('./test/attachment.txt').pipe(doc.attachment.write(fileName, "text/plain", (err) => {
    expect(err).to.be.null;
    expect(doc.attachment.exists(fileName)).to.be.true;
    doc.retrieveLatest((err) => {
      expect(err).to.be.null;
      expect(doc.attachment.exists(fileName)).to.be.true;
      expect(doc.getId()).to.be.ok;
      done();
    });
  }));
}

function assertErase (doc, done) {
  doc.attachment.erase(fileName, (err) => {
    expect(err).to.be.null;
    expect(doc.attachment.exists(fileName)).to.be.false;
    doc.retrieveLatest((err) => {
      expect(err).to.be.null;
      expect(doc.attachment.exists(fileName)).to.be.false;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

function assertGet (doc, done) {
  doc.attachment.get(fileName, (err, data) => {
    expect(err).to.be.null;
    expect(data).to.be.ok;
    expect(doc.getId()).to.be.ok;
    done();
  });
}

function assertRead (doc, done) {
  streamToString(doc.attachment.read(fileName, (err) => {
    expect(err).to.be.null;
    done();
  }), (result) => {
    expect(result).to.equal('This is an example attachment.');
  });
}

function assertErase (doc, done) {
  doc.attachment.erase(fileName, (err) => {
    expect(err).to.be.null;
    expect(doc.attachment.exists(fileName)).to.be.false;
    doc.retrieveLatest((err) => {
      expect(err).to.be.null;
      expect(doc.attachment.exists(fileName)).to.be.false;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

describe('doc-attachment', () => {
  
  describe('document does not exist', () => {
    var _doc;
    before((done) => {
      _doc = undefined;
      db.doc.persist({ hi: "there" }, (err, doc) => {
        _doc = doc;
        _doc.attachment.persist(fileName, "Oops!", "text/plain", () => {
          _doc.erase(() => { done(); })
        });
      });
    });
    
    it('exists', () => {
      // should fail
      expect(_doc.attachment.exists(fileName)).to.be.false;
    });
    it('persist', (done) => {
      // should fail
      _doc.attachment.persist(fileName, "Cannot add here.", "text/plain", (err) => {
        expect(err).to.be.ok;
        expect(_doc.attachment.exists(fileName)).to.be.false;
        expect(_doc.getId()).to.be.null;
        done();
      });
    });
    it('write', (done) => {
      // should fail
      fs.createReadStream('./test/attachment.txt').pipe(_doc.attachment.write(fileName, "text/plain", (err) => {
        expect(err).to.be.ok;
        expect(_doc.attachment.exists(fileName)).to.be.false;
        expect(_doc.getId()).to.be.null;
        done();
      }));
    });
    it('get', (done) => {
      // should fail
      _doc.attachment.get(fileName, (err, data) => {
        expect(err).to.be.ok;
        expect(data).to.be.undefined;
        expect(_doc.getId()).to.be.null;
        done();
      });
    });
    it('read');
    // it('read', (done) => {
    //   // should fail
    //   // FIXME: This doesn't actually return an error if the document doesn't exist
    //   streamToString(_doc.attachment.read(fileName, (err) => {
    //     expect(err).to.be.ok;
    //     done();
    //   }));
    // });
    it('erase', (done) => {
      // should fail
      _doc.attachment.erase(fileName, (err) => {
        expect(err).to.be.ok;
        expect(_doc.attachment.exists(fileName)).to.be.false;
        expect(_doc.getId()).to.be.null;
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
      
      it('exists', () => {
        // should fail
        expect(_doc.attachment.exists(fileName)).to.be.false;
      });
      it('persist', (done) => {
        // should be successful
        assertPersist(_doc, done);
      });
      it('persist retries', (done) => {
        // should be successful
        forceUpdate(_doc, { changed: "bootboot" }, () => {
          assertPersist(_doc, done);
        });
      });
      it('persist more than maxTries', (done) => {
        // should fail
        forceUpdate(_doc, { a: 'change' }, () => {
          _doc.attachment.persist(fileName, "Too many tries.", "text/plain", (err) => {
            expect(err).to.be.ok;
            expect(_doc.attachment.exists(fileName)).to.be.false;
            expect(_doc.getId()).to.be.ok;
            done();
          }, db.maxTries); // tried x times
        });
      });
      it('write', (done) => {
        // should be successful
        assertWrite(_doc, done);
      });
      it('get', (done) => {
        // should fail
        _doc.attachment.get(fileName, (err, data) => {
          expect(err).to.be.ok;
          expect(data).to.be.undefined;
          expect(_doc.getId()).to.be.ok;
          done();
        });
      });
      it('read', (done) => {
        // should fail
        streamToString(_doc.attachment.read(fileName, (err) => {
          expect(err).to.be.ok;
          done();
        }));
      });
      it('erase', (done) => {
        // should be successful
        // FIXME: should maybe not be successful
        assertErase(_doc, done);
      });
    });
    
    describe('attachment exists', () => {
      beforeEach((done) => {
        _doc.attachment.erase(fileName, () => {
          _doc.attachment.persist(fileName, "This is an example attachment.", "text/plain", (err) => { done(); });
        });
      });
      
      it('exists', () => {
        // should be successful
        expect(_doc.attachment.exists(fileName)).to.be.true;
      });
      it('persist', (done) => {
        // should be successful
        assertPersist(_doc, done);
      });
      it('write', (done) => {
        // should be successful
        assertWrite(_doc, done);
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
      it('erase retries', (done) => {
        // should be successful
        forceUpdate(_doc, { changed: "batty" }, () => {
          assertErase(_doc, done);
        });
      });
      it('erase more than maxTries', (done) => {
        // should fail
        forceUpdate(_doc, { a: 'change' }, () => {
          _doc.attachment.erase(fileName, (err) => {
            expect(err).to.be.ok;
            expect(_doc.attachment.exists(fileName)).to.be.true;
            expect(_doc.getId()).to.be.ok;
            done();
          }, db.maxTries); // tried x times
        });
      });
    });
    
  });
});
