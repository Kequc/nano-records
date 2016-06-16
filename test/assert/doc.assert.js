"use strict";
var mocha = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = require('../helper');

var DocAssert = {};

DocAssert.getId_Fail = (doc) => {
    expect(doc.body['_id']).to.be.undefined;
    expect(doc.getId()).to.be.undefined;
};

DocAssert.getId = (doc) => {
    expect(doc.body['_id']).to.be.ok;
    expect(doc.getId()).to.equal(doc.body['_id']);
};

DocAssert.getRev_Fail = (doc) => {
    expect(doc.body['_rev']).to.be.undefined;
    expect(doc.getRev()).to.be.undefined;
};

DocAssert.getRev = (doc) => {
    expect(doc.body['_rev']).to.be.ok;
    expect(doc.getRev()).to.equal(doc.body['_rev']);
};

DocAssert.getBody_Fail = (doc) => {
    expect(doc.body).to.eql({});
};

DocAssert.getBody = (doc) => {
    let copy = doc.getBody();
    expect(copy).to.include.keys('_id', '_rev');
    expect(copy).to.eql(doc.body);
    expect(copy).to.not.equal(doc.body);
};

DocAssert.read_Fail = (doc, errorName, done) => {
    doc.read((err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    });
};

DocAssert.read = (doc, done) => {
    // check read
    let changes = { more: "Yay!", complex: "cats and dogs" };
    let asserts = deepExtend({}, doc.body, changes);
    Helper.triggerBgUpdate(doc.db, doc.getId(), changes, () => {
        expect(doc.body).to.not.have.keys('more');
        doc.read((err) => {
            expect(err).to.be.undefined;
            expect(doc.body).to.include.keys('complex', 'more', '_id', '_rev');
            Helper.checkBody(doc, asserts, done);
        });
    });
};

DocAssert.write_Fail = (doc, errorName, done) => {
    doc.write({ boo: "oorns" }, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    });
};

DocAssert.write = (doc, done) => {
    let changes = { more: "attributes", complex: "Samsonite" };
    let asserts = deepExtend({}, changes);
    expect(doc.body).to.not.include.keys('more');
    expect(doc.body).to.include.keys('num');
    doc.write(changes, (err) => {
        expect(err).to.be.undefined;
        expect(doc.body).to.include.keys('complex', 'more', '_id', '_rev');
        expect(doc.body).to.not.include.keys('num');
        Helper.checkBody(doc, asserts, done);
    });
};

DocAssert.write_Retries = (doc, done) => {
    Helper.triggerBgUpdate(doc.db, doc.getId(), { anotheranother: "changed" }, () => {
        DocAssert.write(doc, done);
    });
};

DocAssert.write_Retries_Fail = (doc, done) => {
    Helper.triggerBgUpdate(doc.db, doc.getId(), () => {
        doc._write({ boo: "oorns" }, (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("conflict");
            done();
        }, doc.db.maxTries); // tried x times
    });
};

DocAssert.update_Fail = (doc, errorName, done) => {
    doc.update({ boo: "oorns" }, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    });
};

DocAssert.update = (doc, done, moreChanges) => {
    let changes = { more: "attributes", complex: "Samsonite" };
    let asserts = deepExtend({}, moreChanges || {}, changes);
    expect(doc.body).to.not.have.keys('more');
    doc.update(changes, (err) => {
        expect(err).to.be.undefined;
        expect(doc.body).to.include.keys('complex', 'more', '_id', '_rev');
        Helper.checkBody(doc, asserts, done);
    });
};

DocAssert.update_Retries = (doc, done) => {
    let changes = { anotheranother: "changed" };
    Helper.triggerBgUpdate(doc.db, doc.getId(), changes, () => {
        DocAssert.update(doc, done, changes);
    });
};

DocAssert.update_Retries_Fail = (doc, done) => {
    Helper.triggerBgUpdate(doc.db, doc.getId(), () => {
        doc._update({ boo: "oorns" }, (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("conflict");
            done();
        }, doc.db.maxTries); // tried x times
    });
};

DocAssert.head_Fail = (doc, errorName, done) => {
    doc.head((err, rev, result) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(rev).to.be.undefined;
        expect(result).to.be.undefined;
        done();
    });
};

DocAssert.head = (doc, done) => {
    doc.head((err, rev, result) => {
        expect(err).to.be.undefined;
        expect(rev).to.be.ok;
        expect(result).to.be.ok;
        expect(result).to.include.keys('etag');
        done();
    });
};

DocAssert.destroy_Fail = (doc, errorName, done) => {
    doc.destroy((err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    });
};

DocAssert.destroy = (doc, done) => {
    let id = doc.getId();
    doc.destroy((err) => {
        expect(err).to.be.undefined;
        expect(doc.body).to.eql({});
        doc.db.doc.read(id, (err, gotDoc) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("not_found");
            expect(gotDoc).to.be.undefined;
            done();
        });
    });
};

DocAssert.destroy_Retries = (doc, done) => {
    Helper.triggerBgUpdate(doc.db, doc.getId(), { anotheranother: "changed" }, () => {
        DocAssert.destroy(doc, done);
    });
};

DocAssert.destroy_Retries_Fail = (doc, done) => {
    Helper.triggerBgUpdate(doc.db, doc.getId(), () => {
        doc._destroy((err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("conflict");
            done();
        }, doc.db.maxTries); // tried x times
    });
};

module.exports = DocAssert;
