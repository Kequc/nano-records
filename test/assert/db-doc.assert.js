"use strict";
var mocha = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = require('../helper');

var DbDocAssert = {};

DbDocAssert.create = (db, done) => {
    db.doc.create(Helper.complexBody, (err, doc) => {
        expect(err).to.be.undefined;
        expect(doc).to.be.ok;
        Helper.checkBody(doc, Helper.complexBody, done);
    });
};

DbDocAssert.read_Fail = (db, id, errorName, done) => {
    db.doc.read(id, (err, gotDoc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(gotDoc).to.be.undefined;
        done();
    });
};

DbDocAssert.read = (db, id, done) => {
    db.doc.read(id, (err, doc) => {
        expect(err).to.be.undefined;
        expect(doc).to.be.ok;
        expect(doc.getId()).to.equal(id);
        Helper.checkBody(doc, Helper.complexBody, done);
    });
};

DbDocAssert.head_Fail = (db, id, errorName, done) => {
    db.doc.head(id, (err, rev, result) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(rev).to.be.undefined;
        expect(result).to.be.undefined;
        done();
    });
};

DbDocAssert.head = (db, id, done) => {
    db.doc.head(id, (err, rev, result) => {
        expect(err).to.be.undefined;
        expect(rev).to.be.ok;
        expect(result).to.be.ok;
        expect(result).to.include.keys('etag');
        done();
    });
};

DbDocAssert.write_Fail = (db, id, errorName, done) => {
    db.doc.write(id, { will: "fail" }, (err, doc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(doc).to.be.undefined;
        done();
    });
};

DbDocAssert.write = (db, id, done) => {
    let changes = { complex: 'document updated', newly: 'changehere' };
    db.doc.write(id, changes, (err, doc) => {
        expect(err).to.be.undefined;
        expect(doc).to.be.ok;
        expect(doc.getId()).to.equal(id);
        Helper.checkBody(doc, changes, done);
    });
};

DbDocAssert.update_Fail = (db, id, errorName, done) => {
    db.doc.update(id, { will: "fail" }, (err, doc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(doc).to.be.undefined;
        done();
    });
};

DbDocAssert.update = (db, id, done, moreChanges) => {
    let changes = { another: 'one', complex: 'changed' };
    let asserts = deepExtend({}, moreChanges || {}, changes);
    db.doc.update(id, changes, (err, doc) => {
        expect(err).to.be.undefined;
        expect(doc).to.be.ok;
        expect(doc.getId()).to.equal(id);
        Helper.checkBody(doc, asserts, done);
    });
};

DbDocAssert.updateOrWrite_Fail = (db, id, errorName, done) => {
    db.doc.updateOrWrite(id, { will: "fail" }, (err, doc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(doc).to.be.undefined;
        done();
    });
};

DbDocAssert.updateOrWrite = (db, id, done, moreChanges) => {
    let changes = { another: 'one', complex: 'changed' };
    let asserts = deepExtend({}, moreChanges || {}, changes);
    db.doc.updateOrWrite(id, changes, (err, doc) => {
        expect(err).to.be.undefined;
        expect(doc).to.be.ok;
        expect(doc.getId()).to.equal(id);
        Helper.checkBody(doc, asserts, done);
    });
};

DbDocAssert.destroy_Fail = (db, id, errorName, done) => {
    db.doc.destroy(id, (err, doc) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(doc).to.be.undefined;
        done();
    });
};

DbDocAssert.destroy = (db, id, done) => {
    db.doc.destroy(id, (err) => {
        expect(err).to.be.undefined;
        db.doc.read(id, (err, gotDoc) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("not_found");
            expect(gotDoc).to.be.undefined;
            done();
        });
    });
};

module.exports = DbDocAssert;
