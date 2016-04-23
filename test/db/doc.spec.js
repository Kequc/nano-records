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
var fileName = "attachment-doesnt-exist.txt";

function assertBody (doc, asserts, done) {
  for (let key in asserts) {
    if (key == "_attachments")
      expect(Object.keys(doc.body[key])).to.eql(Object.keys(asserts[key]));
    else if (key != "_rev")
      expect(doc.body[key]).to.eql(asserts[key]);
  }
  db.doc.read(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.undefined;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
  });
}

function assertCreate (done) {
  db.doc.create(complexBody, (err, doc) => {
    expect(err).to.be.undefined;
    expect(doc).to.be.ok;
    expect(doc.body).to.have.all.keys('complex', 'num', 'deep', '_id', '_rev');
    assertBody(doc, complexBody, done);
  });
}

function assertRead (doc, done) {
  assertBody(doc, {}, done);
}

function assertHead (id, done) {
  db.doc.head(id, (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    expect(data).to.include.keys('etag');
    done();
  });
}

function assertWrite (id, done) {
  let changes = { complex: 'document updated', updated: 'changehere' };
  db.doc.write(id, changes, (err, doc) => {
    expect(err).to.be.undefined;
    expect(doc).to.be.ok;
    expect(doc.body).to.have.keys('complex', 'updated', '_id', '_rev');
    expect(doc.getId()).to.equal(id);
    assertBody(doc, changes, done);
  });
}

function assertUpdate (id, done, asserts) {
  let changes = { another: 'one', complex: 'changed' };
  asserts = deepExtend({}, asserts || {}, changes);
  db.doc.update(id, changes, (err, doc) => {
    expect(err).to.be.undefined;
    expect(doc).to.be.ok;
    expect(doc.body).to.include.keys('another', 'complex', '_id', '_rev');
    expect(doc.getId()).to.equal(id);
    assertBody(doc, asserts, done);
  });
}

function assertDestroy (id, done) {
  db.doc.destroy(id, (err) => {
    expect(err).to.be.undefined;
    db.doc.read(id, (err, gotDoc) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("not_found");
      expect(gotDoc).to.be.undefined;
      done();
    });
  });
}

describe('db-doc', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('database does not exist', () => {
    beforeEach((done) => {
      db.destroy('_DESTROY_', () => { done(); });
    });
    
    it('create', (done) => {
      // should be successful
      assertCreate(done);
    });
    it('read', (done) => {
      // should fail
      db.doc.read("fake-id-doesnt-exist", (err, gotDoc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        expect(gotDoc).to.be.undefined;
        done();
      });
    });
    it('head', (done) => {
      // should fail
      db.doc.head("fake-id-doesnt-exist", (err, data) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal("not_found");
        expect(data).to.be.undefined;
        done();
      });
    });
    it('write', (done) => {
      // should be successful
      assertWrite("fake-id-doesnt-exist", done);
    });
    it('update', (done) => {
      // should be successful
      assertUpdate("fake-id-doesnt-exist", done);
    });
    it('destroy', (done) => {
      // should be successful
      assertDestroy("fake-id-doesnt-exist", done);
    });
  });
  
  describe('database exists', () => {
    before((done) => {
      db.reset('_RESET_', () => { done(); });
    });
    
    describe('document does not exist', () => {
      
      it('create', (done) => {
        // should be successful
        assertCreate(done);
      });
      it('read', (done) => {
        // should fail
        db.doc.read("fake-id-doesnt-exist", (err, doc) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          expect(doc).to.be.undefined;
          done();
        });
      });
      it('head', (done) => {
        // should fail
        db.doc.head("fake-id-doesnt-exist", (err, data) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("not_found");
          expect(data).to.be.undefined;
          done();
        });
      });
      it('write', (done) => {
        // should be successful
        assertWrite("fake-id-doesnt-exist", done);
      });
      it('update', (done) => {
        // should be successful
        assertUpdate("fake-id-doesnt-exist", done);
      });
      it('destroy', (done) => {
        // should be successful
        assertDestroy("fake-id-doesnt-exist", done);
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
      
      describe('attachment does not exist', () => {
        
        it('create', (done) => {
          // should be successful
          assertCreate(done);
        });
        it('read', (done) => {
          // should be successful
          assertRead(_doc, done);
        });
        it('head', (done) => {
          // should be successful
          assertHead(_doc.getId(), done);
        });
        it('write', (done) => {
          // should be successful
          assertWrite(_doc.getId(), done);
        });
        it('update', (done) => {
          // should be successful
          assertUpdate(_doc.getId(), done, _doc.body);
        });
        it('destroy', (done) => {
          // should be successful
          assertDestroy(_doc.getId(), done);
        });
        
      });
      describe('attachment exists', () => {
        beforeEach((done) => {
          _doc.attachment.write(fileName, "This is an example attachment.", "text/plain", () => {
            _doc.read(() => { done(); });
          });
        });
        
        it('create', (done) => {
          // should be successful
          assertCreate(done);
        });
        it('read', (done) => {
          // should be successful
          assertRead(_doc, done);
        });
        it('head', (done) => {
          // should be successful
          assertHead(_doc.getId(), done);
        });
        it('write', (done) => {
          // should be successful
          assertWrite(_doc.getId(), done);
        });
        it('update', (done) => {
          // should be successful
          assertUpdate(_doc.getId(), done, _doc.body);
        });
        it('destroy', (done) => {
          // should be successful
          assertDestroy(_doc.getId(), done);
        });
        
      });
      
    });
  });
  
});
