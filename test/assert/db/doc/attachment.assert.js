"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Util = require('../../util');

var DbDocAttachmentAssert = {};

DbDocAttachmentAssert.read_Fail = (db, id, errorName, done) => {
  db.doc.attachment.read(id, Util.fileName, (err, data) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(data).to.be.undefined;
    done();
  });
};

DbDocAttachmentAssert.read = (db, id, done) => {
  db.doc.attachment.read(id, Util.fileName, (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.equal(Util.fileContent);
    done();
  });
};

DbDocAttachmentAssert.readStream_Fail = (db, id, errorName, done) => {
  Util.streamToString(db.doc.attachment.readStream(id, Util.fileName, (err) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    done();
  }), (result) => {
    expect(result).to.be.ok;
    // expect(result).to.equal("");
  });
};

DbDocAttachmentAssert.readStream = (db, id, done) => {
  Util.streamToString(db.doc.attachment.readStream(id, Util.fileName, (err) => {
    expect(err).to.be.undefined;
    done();
  }), (result) => {
    expect(result).to.equal(Util.fileContent);
  });
};

DbDocAttachmentAssert.write_Fail = (db, id, errorName, done) => {
  db.doc.attachment.write(id, Util.fileName, "Cannot write here.", "text/plain", (err) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    done();
  });
};

DbDocAttachmentAssert.write = (db, id, done) => {
  db.doc.attachment.write(id, Util.fileName, "Can write here.", "text/plain", (err, doc) => {
    expect(doc.attachment.exists(Util.fileName)).to.be.true;
    expect(doc.body).to.include.keys('_attachments', '_id', '_rev');
    Util.checkBody(doc, {}, done);
  });
};

DbDocAttachmentAssert.destroy_Fail = (db, id, errorName, done) => {
  db.doc.attachment.destroy(id, Util.fileName, (err) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    done();
  });
};

DbDocAttachmentAssert.destroy = (db, id, done) => {
  db.doc.attachment.destroy(id, Util.fileName, (err) => {
    expect(err).to.be.undefined;
    db.doc.read(id, (err, doc) => {
      expect(err).to.be.undefined;
      expect(doc.attachment.exists(Util.fileName)).to.be.false;
      done();
    });
  });
};

module.exports = DbDocAttachmentAssert;
