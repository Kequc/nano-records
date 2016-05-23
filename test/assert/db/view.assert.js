"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = require('../../helper');

var DbViewAssert = {};

DbViewAssert.all_Fail = (db, key, params, errorName, done) => {
  db.view.all(key, params, (err, list) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(list).to.be.undefined;
    done();
  });
};

DbViewAssert.all = (db, key, params, expected, done) => {
  db.view.all(key, params, (err, list) => {
    expect(err).to.be.undefined;
    expect(list).to.be.ok;
    expect(list.total).to.equal(expected.length);
    expect(list.rows.length).to.equal(expected.length);
    for (let doc of expected) {
      let index = list.ids().indexOf(doc.getId());
      expect(index).to.be.above(-1);
      expect(list.doc(index).body).to.eql(doc.body);
    }
    done();
  });
};

DbViewAssert.only_Fail = (db, key, value, params, errorName, done) => {
  db.view.only(key, value, params, (err, list) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(list).to.be.undefined;
    done();
  });
};

DbViewAssert.only = (db, key, value, params, expected, done) => {
  db.view.only(key, value, params, (err, list) => {
    expect(err).to.be.undefined;
    expect(list).to.be.ok;
    expect(list.total).to.equal(expected.length);
    expect(list.rows.length).to.equal(expected.length);
    for (let doc of expected) {
      let index = list.ids().indexOf(doc.getId());
      expect(index).to.be.above(-1);
      expect(list.doc(index).body).to.eql(doc.body);
    }
    done();
  });
};

DbViewAssert.read_Fail = (db, id, name, errorName, done) => {
  db.view.read(id, name, {}, (err, list) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(list).to.be.undefined;
    done();
  });
};

DbViewAssert.read = (db, id, name, done) => {
  db.view.read(id, name, {}, (err, list) => {
    expect(err).to.be.undefined;
    expect(list).to.be.ok;
    expect(list.total).to.be.ok;
    expect(list.rows).to.be.ok;
    done();
  });
};

// TODO: not currently a way to test this
DbViewAssert.read_Retries = (db, id, name, done) => {
  Helper.triggerBgDesignUpdate(db, id, () => {
    DbDesign.read(db, id, name, done);
  });
};

// TODO: not currently a way to test this
DbViewAssert.read_Retries_Fail = (db, id, name, done) => {
  Helper.triggerBgDesignUpdate(db, id, () => {
    db.view.read(id, name, {}, (err, list) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("conflict");
      expect(list).to.be.undefined;
      done();
    }, db.maxTries); // tried x times
  });
};

module.exports = DbViewAssert;
