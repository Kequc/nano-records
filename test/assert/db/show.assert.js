"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = require('../../helper');

var DbShowAssert = {};

DbShowAssert.read_Fail = (db, id, name, errorName, done) => {
  db.show.read(id, name, Helper.id, (err, result) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(result).to.be.undefined;
    done();
  });
};

DbShowAssert.read = (db, id, name, asserts, done) => {
  db.show.read(id, name, Helper.id, (err, result) => {
    expect(err).to.be.undefined;
    expect(result).to.be.ok;
    expect(result).to.equal(asserts);
    done();
  });
};

// TODO: not currently a way to test this
DbShowAssert.read_Retries = (db, id, name, asserts, done) => {
  Helper.triggerBgDesignUpdate(db, id, () => {
    DbDesign.read(db, id, name, asserts, done);
  });
};

// TODO: not currently a way to test this
DbShowAssert.read_Retries_Fail = (db, id, name, done) => {
  Helper.triggerBgDesignUpdate(db, "foo", () => {
    db.show.read(id, name, Helper.id, (err, result) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("conflict");
      expect(result).to.be.undefined;
      done();
    }, db.maxTries); // tried x times
  });
};

module.exports = DbShowAssert;
