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

function assertCreate (done) {
  db.doc.create(complexBody, (err, doc) => {
    expect(err).to.be.undefined;
    expect(doc).to.be.ok;
    expect(doc.body).to.have.all.keys('complex', 'num', 'deep', '_id', '_rev');
    expect(doc.body['deep']).to.have.all.keys('hi', 'arr');
    expect(doc.body['deep']['arr']).to.eql(["some", "values"]);
    db.doc.read(doc.getId(), (err, gotDoc) => {
      expect(err).to.be.undefined;
      expect(gotDoc).to.be.ok;
      expect(gotDoc.body).to.eql(doc.body);
      done();
    });
  });
}

function assertRead (doc, done) {
  db.doc.read(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.undefined;
    expect(gotDoc).to.be.ok;
      expect(gotDoc.body).to.eql(doc.body);
    done();
  });
}

function assertBody (doc, asserts, done) {
  for (let key in asserts) {
    if (key != "_rev")
      expect(doc.body[key]).to.eql(asserts[key]);
  }
  expect(asserts['_rev']).to.not.equal(doc.getRev());
  db.doc.read(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.undefined;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
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

// function assertUpdate (doc, done) {
//   let changes = { complex: 'document updated', updated: 'changehere' };
//   let asserts = deepExtend({}, doc.body, changes);
//   db.doc.update(doc.getId(), changes, (err) => {
//     expect(err).to.be.undefined;
//     doc.read((err) => {
//       expect(err).to.be.undefined;
//       expect(doc.body).to.include.keys('complex', 'updated', '_id', '_rev');
//       assertBody(doc, asserts, done);
//     });
//   });
// }

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
    // it('update', (done) => {
    //   // should fail
    //   db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, (err) => {
    //     expect(err).to.be.ok;
    //     expect(err.name).to.equal("not_found");
    //     done();
    //   });
    // });
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
      beforeEach((done) => {
        db.doc.destroy("fake-id-doesnt-exist", () => { done(); })
      });
      
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
      // it('update', (done) => {
      //   // should fail
      //   db.doc.update("fake-id-doesnt-exist", { blah: 'will fail' }, (err) => {
      //     expect(err).to.be.ok;
      //     expect(err.name).to.equal("not_found");
      //     done();
      //   });
      // });
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
      
      it('create', (done) => {
        // should be successful
        assertCreate(done);
      });
      it('read', (done) => {
        // should be successful
        assertRead(_doc, done);
      });
      // it('update', (done) => {
      //   // should be successful
      //   assertUpdate(_doc, done);
      // });
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
