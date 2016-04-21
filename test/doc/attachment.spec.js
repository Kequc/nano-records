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

function assertWrite (doc, done) {
  doc.attachment.write(fileName, "Can write here.", "text/plain", (err) => {
    expect(err).to.be.undefined;
    expect(doc.attachment.exists(fileName)).to.be.true;
    doc.read((err) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(fileName)).to.be.true;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

function assertWriteStream (doc, done) {
  fs.createReadStream('./test/attachment.txt').pipe(doc.attachment.writeStream(fileName, "text/plain", (err) => {
    expect(err).to.be.undefined;
    expect(doc.attachment.exists(fileName)).to.be.true;
    doc.read((err) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(fileName)).to.be.true;
      expect(doc.getId()).to.be.ok;
      done();
    });
  }));
}

function assertRead (doc, done) {
  doc.attachment.read(fileName, (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    expect(doc.attachment.exists(fileName)).to.be.true;
    expect(doc.getId()).to.be.ok;
    done();
  });
}

function assertReadStream (doc, done) {
  streamToString(doc.attachment.readStream(fileName, (err) => {
    expect(err).to.be.undefined;
    expect(doc.attachment.exists(fileName)).to.be.true;
    done();
  }), (result) => {
    expect(result).to.equal('This is an example attachment.');
  });
}

function assertDestroy (doc, done) {
  doc.attachment.destroy(fileName, (err) => {
    expect(err).to.be.undefined;
    expect(doc.attachment.exists(fileName)).to.be.false;
    doc.read((err) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(fileName)).to.be.false;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

describe('doc-attachment', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('document does not exist', () => {
    var _doc;
    before((done) => {
      _doc = undefined;
      db.doc.create({ hi: "there" }, (err, doc) => {
        _doc = doc;
        _doc.attachment.write(fileName, "Oops!", "text/plain", () => {
          _doc.destroy(() => { done(); })
        });
      });
    });
    
    it('list', () => {
      // should fail
      expect(_doc.attachment.list()).to.eql([]);
    });
    it('exists', () => {
      // should fail
      expect(_doc.attachment.exists(fileName)).to.be.false;
    });
    it('write', (done) => {
      // should fail
      _doc.attachment.write(fileName, "Cannot add here.", "text/plain", (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        expect(_doc.attachment.exists(fileName)).to.be.false;
        expect(_doc.getId()).to.be.null;
        done();
      });
    });
    it('writeStream', (done) => {
      // should fail
      fs.createReadStream('./test/attachment.txt').pipe(_doc.attachment.writeStream(fileName, "text/plain", (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        expect(_doc.attachment.exists(fileName)).to.be.false;
        expect(_doc.getId()).to.be.null;
        done();
      }));
    });
    it('read', (done) => {
      // should fail
      _doc.attachment.read(fileName, (err, data) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        expect(data).to.be.undefined;
        expect(_doc.getId()).to.be.null;
        done();
      });
    });
    it('readStream', (done) => {
      // should fail
      streamToString(_doc.attachment.readStream(fileName, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
        done();
      }), (result) => {
        expect(result).to.equal("");
      });
    });
    it('destroy', (done) => {
      // should fail
      _doc.attachment.destroy(fileName, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("missing_id");
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
      db.doc.create({ hi: "there" }, (err, doc) => {
        _doc = doc;
        done();
      });
    });
    
    describe('attachment does not exist', () => {
      beforeEach((done) => {
        _doc.attachment.destroy(fileName, () => { done(); });
      });
      
      it('list', () => {
        // should fail
        expect(_doc.attachment.list()).to.eql([]);
      });
      it('exists', () => {
        // should fail
        expect(_doc.attachment.exists(fileName)).to.be.false;
      });
      it('write', (done) => {
        // should be successful
        assertWrite(_doc, done);
      });
      it('write retries', (done) => {
        // should be successful
        forceUpdate(_doc, { changed: "bootboot" }, () => {
          assertWrite(_doc, done);
        });
      });
      it('write more than maxTries', (done) => {
        // should fail
        forceUpdate(_doc, { a: 'change' }, () => {
          _doc.attachment.write(fileName, "Too many tries.", "text/plain", (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("conflict");
            expect(_doc.attachment.exists(fileName)).to.be.false;
            expect(_doc.getId()).to.be.ok;
            done();
          }, db.maxTries); // tried x times
        });
      });
      it('writeStream', (done) => {
        // should be successful
        assertWriteStream(_doc, done);
      });
      it('read', (done) => {
        // should fail
        _doc.attachment.read(fileName, (err, data) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          expect(data).to.be.undefined;
          expect(_doc.getId()).to.be.ok;
          done();
        });
      });
      it('readStream', (done) => {
        // should fail
        streamToString(_doc.attachment.readStream(fileName, (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          done();
        }), (result) => {
          expect(result).to.be.ok;
          // expect(result).to.equal("");
        });
      });
      it('destroy', (done) => {
        // should be successful
        assertDestroy(_doc, done);
      });
    });
    
    describe('attachment exists', () => {
      beforeEach((done) => {
        _doc.attachment.write(fileName, "This is an example attachment.", "text/plain", (err) => { done(); });
      });
      
      it('list', () => {
        // should be successful
        expect(_doc.attachment.list()).to.eql([fileName]);
      });
      it('exists', () => {
        // should be successful
        expect(_doc.attachment.exists(fileName)).to.be.true;
      });
      it('write', (done) => {
        // should be successful
        assertWrite(_doc, done);
      });
      it('writeStream', (done) => {
        // should be successful
        assertWriteStream(_doc, done);
      });
      it('read', (done) => {
        // should be successful
        assertRead(_doc, done);
      });
      it('readStream', (done) => {
        // should be successful
        assertReadStream(_doc, done);
      });
      it('destroy', (done) => {
        // should be successful
        assertDestroy(_doc, done);
      });
      it('destroy retries', (done) => {
        // should be successful
        forceUpdate(_doc, { changed: "batty" }, () => {
          assertDestroy(_doc, done);
        });
      });
      it('destroy more than maxTries', (done) => {
        // should fail
        forceUpdate(_doc, { a: 'change' }, () => {
          _doc.attachment.destroy(fileName, (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("conflict");
            expect(_doc.attachment.exists(fileName)).to.be.true;
            expect(_doc.getId()).to.be.ok;
            done();
          }, db.maxTries); // tried x times
        });
      });
    });
    
  });
});
