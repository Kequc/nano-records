"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;

var dbName = 'nano-records-db-doc-attachment-test';

var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

var simpleBody = { hi: "there" };
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

function assertBody (doc, done) {
  db.doc.read(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.undefined;
    expect(gotDoc).to.be.ok;
    for (let key in doc.body) {
      if (key == "_attachments")
        expect(Object.keys(doc.body[key])).to.eql(Object.keys(gotDoc.body[key]));
      else if (key != "_rev")
        expect(doc.body[key]).to.eql(gotDoc.body[key]);
    }
    done();
  });
}

function assertWrite (id, done) {
  db.doc.attachment.write(id, fileName, "Can write here.", "text/plain", (err, doc) => {
    expect(doc.attachment.exists(fileName)).to.be.true;
    expect(doc.body).to.include.keys('_attachments', '_id', '_rev');
    assertBody(doc, done);
  });
}

function assertForcedWrite (id, done) {
  db.doc.attachment.forcedWrite(id, fileName, "Can write here.", "text/plain", (err, doc) => {
    expect(doc.attachment.exists(fileName)).to.be.true;
    expect(doc.body).to.include.keys('_attachments', '_id', '_rev');
    assertBody(doc, done);
  });
}

function assertRead (doc, done) {
  assertBody(doc, done);
}

function assertReadStream (doc, done) {
  streamToString(db.doc.attachment.readStream(doc.getId(), fileName, (err) => {
    expect(err).to.be.undefined;
    done();
  }), (result) => {
    expect(result).to.equal('This is an example attachment.');
  });
}

function assertDestroy (doc, done) {
  db.doc.attachment.destroy(doc.getId(), fileName, (err) => {
    expect(err).to.be.undefined;
    doc.read((err) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(fileName)).to.be.false;
      expect(doc.getId()).to.be.ok;
      done();
    });
  });
}

describe('db-doc-attachment', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });

  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('write', (done) => {
      // should fail
      db.doc.attachment.write("fake-id-doesnt-exist", fileName, "Cannot write here.", "text/plain", (err, doc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        expect(doc).to.be.undefined;
        done();
      });
    });
    it('forcedWrite', (done) => {
      // should be successful
      assertForcedWrite("fake-id-doesnt-exist", done);
    });
    it('read', (done) => {
      // should fail
      db.doc.attachment.read("fake-id-doesnt-exist", fileName, (err, data) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        expect(data).to.be.undefined;
        done();
      });
    });
    it('readStream', (done) => {
      // should fail
      streamToString(db.doc.attachment.readStream("fake-id-doesnt-exist", fileName, (err) => {
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
      db.doc.attachment.destroy("fake-id-doesnt-exist", fileName, (err) => {
        expect(err).to.be.undefined;
        done();
      });
    });
    
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('document does not exist', () => {
      beforeEach((done) => {
        db.doc.destroy("fake-id-doesnt-exist", () => { done(); })
      });
      
      it('write', (done) => {
        // should fail
        db.doc.attachment.write("fake-id-doesnt-exist", fileName, "Cannot write here.", "text/plain", (err, doc) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          expect(doc).to.be.undefined;
          done();
        });
      });
      it('forcedWrite', (done) => {
        // should be successful
        assertForcedWrite("fake-id-doesnt-exist", done);
      });
      it('read', (done) => {
        // should fail
        db.doc.attachment.read("fake-id-doesnt-exist", fileName, (err, data) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          expect(data).to.be.undefined;
          done();
        });
      });
      it('readStream', (done) => {
        // should fail
        streamToString(db.doc.attachment.readStream("fake-id-doesnt-exist", fileName, (err) => {
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
        db.doc.attachment.destroy("fake-id-doesnt-exist", fileName, (err) => {
          expect(err).to.be.undefined;
          done();
        });
      });
      
    });
    
    describe('document exists', () => {
      var _doc;
      beforeEach((done) => {
        _doc = undefined;
        db.doc.create(simpleBody, (err, doc) => {
          _doc = doc;
          done();
        });
      });
      
      describe('attachment does not exist', () => {
        
        it('write', (done) => {
          // should be successful
          assertWrite(_doc.getId(), done);
        });
        it('forcedWrite', (done) => {
          // should be successful
          assertForcedWrite(_doc.getId(), done);
        });
        it('read', (done) => {
          // should fail
          db.doc.attachment.read(_doc.getId(), fileName, (err, data) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("not_found");
            expect(data).to.be.undefined;
            expect(_doc.getId()).to.be.ok;
            done();
          });
        });
        it('readStream', (done) => {
          // should fail
          streamToString(db.doc.attachment.readStream(_doc.getId(), fileName, (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("not_found");
            expect(_doc.getId()).to.be.ok;
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
          _doc.attachment.write(fileName, "This is an example attachment.", "text/plain", () => {
            _doc.read(() => { done(); });
          });
        });
        
        it('write', (done) => {
          // should be successful
          assertWrite(_doc.getId(), done);
        });
        it('forcedWrite', (done) => {
          // should be successful
          assertForcedWrite(_doc.getId(), done);
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
        
      });
      
    });
    
  });
});
