"use strict";
var mocha = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = require('../helper');

var DbDocAttachmentAssert = {};

DbDocAttachmentAssert.read_Fail = (db, id, errorName, done) => {
    db.doc.attachment.read(id, Helper.fileName, (err, data) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        expect(data).to.be.undefined;
        done();
    });
};

DbDocAttachmentAssert.read = (db, id, done) => {
    db.doc.attachment.read(id, Helper.fileName, (err, data) => {
        expect(err).to.be.undefined;
        expect(data).to.be.ok;
        expect(Helper.bufferToString(data)).to.equal(Helper.fileContent);
        done();
    });
};

DbDocAttachmentAssert.createReadStream_Fail = (db, id, errorName, done) => {
    Helper.streamToString(db.doc.attachment.createReadStream(id, Helper.fileName, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    }), (result) => {
        if (result == "")
            expect(result).to.equal("");
        else
            expect(JSON.parse(result)).to.include.keys('error', 'reason');
    });
};

DbDocAttachmentAssert.createReadStream = (db, id, done) => {
    Helper.streamToString(db.doc.attachment.createReadStream(id, Helper.fileName, (err) => {
        expect(err).to.be.undefined;
        done();
    }), (result) => {
        expect(result).to.equal(Helper.fileContent);
    });
};

DbDocAttachmentAssert.write_Fail = (db, id, errorName, done) => {
    db.doc.attachment.write(id, Helper.fileName, "Cannot write here.", "text/plain", (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    });
};

DbDocAttachmentAssert.write = (db, id, done) => {
    db.doc.attachment.write(id, Helper.fileName, "Can write here.", "text/plain", (err) => {
        expect(err).to.be.undefined;
        db.doc.read(id, (err, doc) => {
            expect(err).to.be.undefined;
            expect(doc).to.be.ok;
            expect(doc.attachment.exists(Helper.fileName)).to.be.true;
            expect(doc.body).to.include.keys('_attachments', '_id', '_rev');
            done();
        });
    });
};

DbDocAttachmentAssert.destroy_Fail = (db, id, errorName, done) => {
    db.doc.attachment.destroy(id, Helper.fileName, (err) => {
        expect(err).to.be.ok;
        expect(err.name).to.equal(errorName);
        done();
    });
};

DbDocAttachmentAssert.destroy = (db, id, done) => {
    db.doc.attachment.destroy(id, Helper.fileName, (err) => {
        expect(err).to.be.undefined;
        db.doc.read(id, (err, doc) => {
            if (err && err.name == "not_found")
                done();
            else {
                expect(err).to.be.undefined;
                expect(doc.attachment.exists(Helper.fileName)).to.be.false;
                done();
            }
        });
    });
};

module.exports = DbDocAttachmentAssert;
