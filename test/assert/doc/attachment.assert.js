"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');
var fs = require('fs');

var Util = require('../util');

var DocAttachmentAssert = {};

DocAttachmentAssert.list = (doc, arr) => {
  expect(doc.attachment.list()).to.eql(arr);
};

DocAttachmentAssert.exists = (doc, exists) => {
  expect(doc.attachment.exists(Util.fileName)).to.equal(exists);
};

DocAttachmentAssert.read_Fail = (doc, errorName, done) => {
  doc.attachment.read(Util.fileName, (err, data) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(data).to.be.undefined;
    done();
  });
};

DocAttachmentAssert.read = (doc, done) => {
  doc.attachment.read(Util.fileName, (err, data) => {
    expect(err).to.be.undefined;
    expect(data).to.be.ok;
    DocAttachmentAssert.exists(doc, true);
    done();
  });
};

DocAttachmentAssert.createReadStream_Fail = (doc, errorName, done) => {
  Util.streamToString(doc.attachment.createReadStream(Util.fileName, (err) => {
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

DocAttachmentAssert.createReadStream = (doc, done) => {
  Util.streamToString(doc.attachment.createReadStream(Util.fileName, (err) => {
    expect(err).to.be.undefined;
    DocAttachmentAssert.exists(doc, true);
    done();
  }), (result) => {
    expect(result).to.equal('This is an example attachment.');
  });
};

DocAttachmentAssert.write_Fail = (doc, errorName, exists, done) => {
  let oldRev = doc.getRev();
  doc.attachment.write(Util.fileName, "Cannot add here.", "text/plain", (err) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    DocAttachmentAssert.exists(doc, exists);
    expect(doc.getRev()).to.equal(oldRev);
    done();
  });
};

DocAttachmentAssert.write = (doc, done) => {
  let oldRev = doc.getRev();
  doc.attachment.write(Util.fileName, "Can write here.", "text/plain", (err) => {
    expect(err).to.be.undefined;
    DocAttachmentAssert.exists(doc, true);
    expect(doc.getRev()).to.equal(oldRev);
    doc.read((err) => {
      expect(err).to.be.undefined;
      DocAttachmentAssert.exists(doc, true);
      expect(doc.getRev()).to.not.equal(oldRev);
      done();
    });
  });
};

DocAttachmentAssert.write_Retries = (doc, done) => {
  Util.triggerBgUpdate(doc.db, doc.getId(), () => {
    DocAttachmentAssert.write(doc, done);
  });
};

DocAttachmentAssert.write_Retries_Fail = (doc, exists, done) => {
  Util.triggerBgUpdate(doc.db, doc.getId(), () => {
    let oldRev = doc.getRev();
    doc.attachment.write(Util.fileName, "Too many tries.", "text/plain", (err) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("conflict");
      DocAttachmentAssert.exists(doc, exists);
      expect(doc.getRev()).to.equal(oldRev);
      done();
    }, doc.db.maxTries); // tried x times
  });
};

DocAttachmentAssert.createWriteStream_Fail = (doc, errorName, exists, done) => {
  let oldRev = doc.getRev();
  fs.createReadStream('./test/attachment.txt').pipe(doc.attachment.createWriteStream(Util.fileName, "text/plain", (err) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    DocAttachmentAssert.exists(doc, exists);
    expect(doc.getRev()).to.equal(oldRev);
    done();
  }));
};

DocAttachmentAssert.createWriteStream = (doc, done) => {
  let oldRev = doc.getRev();
  fs.createReadStream('./test/attachment.txt').pipe(doc.attachment.createWriteStream(Util.fileName, "text/plain", (err) => {
    expect(err).to.be.undefined;
    DocAttachmentAssert.exists(doc, true);
    expect(doc.getRev()).to.equal(oldRev);
    doc.read((err) => {
      expect(err).to.be.undefined;
      DocAttachmentAssert.exists(doc, true);
      expect(doc.getRev()).to.not.equal(oldRev);
      done();
    });
  }));
};

DocAttachmentAssert.destroy_Fail = (doc, errorName, exists, done) => {
  doc.attachment.destroy(Util.fileName, (err) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    DocAttachmentAssert.exists(doc, exists);
    done();
  });
};

DocAttachmentAssert.destroy = (doc, done) => {
  let oldRev = doc.getRev();
  doc.attachment.destroy(Util.fileName, (err) => {
    expect(err).to.be.undefined;
    DocAttachmentAssert.exists(doc, false);
    expect(doc.getRev()).to.equal(oldRev);
    doc.read((err) => {
      expect(err).to.be.undefined;
      DocAttachmentAssert.exists(doc, false);
      expect(doc.getRev()).to.not.equal(oldRev);
      done();
    });
  });
};

DocAttachmentAssert.destroy_Retries = (doc, done) => {
  Util.triggerBgUpdate(doc.db, doc.getId(), () => {
    DocAttachmentAssert.destroy(doc, done);
  });
};

DocAttachmentAssert.destroy_Retries_Fail = (doc, exists, done) => {
  Util.triggerBgUpdate(doc.db, doc.getId(), () => {
    let oldRev = doc.getRev();
    doc.attachment.destroy(Util.fileName, (err) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("conflict");
      DocAttachmentAssert.exists(doc, exists);
      expect(doc.getRev()).to.equal(oldRev);
      done();
    }, doc.db.maxTries); // tried x times
  });
};

module.exports = DocAttachmentAssert;
