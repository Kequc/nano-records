"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Util = require('../util');

// TODO: not currently in use
// var triggerBgUpdate = (db, callback) => {
//   Util.triggerBgUpdate(db, "_design/foo", { shows: { cats: "function (doc, req) { return 'yo'; }" } }, callback);
// }

var DbDesignAssert = {};

DbDesignAssert.view_Fail = (db, id, name, errorName, done) => {
  db.design.view(id, name, {}, (err, result) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(result).to.be.undefined;
    done();
  });
};

DbDesignAssert.view = (db, id, name, done) => {
  db.design.view(id, name, {}, (err, result) => {
    expect(err).to.be.undefined;
    expect(result).to.be.ok;
    expect(result).to.include.keys('rows');
    done();
  });
};

DbDesignAssert.view_Retries = (db, id, name, done) => {
  // TODO: not currently a way to test this
  // triggerBgUpdate(db, () => {
  //   DbDesign.view(db, name, done);
  // });
  done();
};

DbDesignAssert.view_Retries_Fail = (db, id, name, done) => {
  // TODO: not currently a way to test this
  // triggerBgUpdate(db, () => {
  //   db.design.view(id, name, {}, (err, result) => {
  //     expect(err).to.be.ok;
  //     expect(err.name).to.equal("conflict");
  //     expect(result).to.be.undefined;
  //     done();
  //   }, db.maxTries); // tried x times
  // });
  done();
};

DbDesignAssert.show_Fail = (db, id, name, errorName, done) => {
  db.design.show(id, name, "fake-id-doesnt-exist", (err, result) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(result).to.be.undefined;
    done();
  });
};

DbDesignAssert.show = (db, id, name, asserts, done) => {
  db.design.show(id, name, "fake-id-doesnt-exist", (err, result) => {
    expect(err).to.be.undefined;
    expect(result).to.be.ok;
    expect(result).to.equal(asserts);
    done();
  });
};

DbDesignAssert.show_Retries = (db, id, name, asserts, done) => {
  // TODO: not currently a way to test this
  // triggerBgUpdate(db, () => {
  //   DbDesign.show(db, name, asserts, done);
  // });
  done();
};

DbDesignAssert.show_Retries_Fail = (db, id, name, done) => {
  // TODO: not currently a way to test this
  // triggerBgUpdate(db, () => {
  //   db.design.show(id, name, "fake-id-doesnt-exist", (err, result) => {
  //     expect(err).to.be.ok;
  //     expect(err.name).to.equal("conflict");
  //     expect(result).to.be.undefined;
  //     done();
  //   }, db.maxTries); // tried x times
  // });
  done();
};

module.exports = DbDesignAssert;
