"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = require('../../helper');

var DbShowAssert = {};

DbShowAssert.explicit_Fail = (db, design, name, errorName, done) => {
  db.show.explicit(Helper.id, design, name, (err, result) => {
    expect(err).to.be.ok;
    expect(err.name).to.equal(errorName);
    expect(result).to.be.undefined;
    done();
  });
};

DbShowAssert.explicit = (db, design, name, asserts, done) => {
  db.show.explicit(Helper.id, design, name, (err, result) => {
    expect(err).to.be.undefined;
    expect(result).to.be.ok;
    expect(result).to.equal(asserts);
    done();
  });
};

// TODO: not currently a way to test this
DbShowAssert.explicit_Retries = (db, id, name, asserts, done) => {
  Helper.triggerBgDesignUpdate(db, design, () => {
    DbDesign.explicit(db, design, name, asserts, done);
  });
};

// TODO: not currently a way to test this
DbShowAssert.explicit_Retries_Fail = (db, design, name, done) => {
  Helper.triggerBgDesignUpdate(db, "foo", () => {
    db.show.explicit(Helper.id, design, name, (err, result) => {
      expect(err).to.be.ok;
      expect(err.name).to.equal("conflict");
      expect(result).to.be.undefined;
      done();
    }, db.maxTries); // tried x times
  });
};

module.exports = DbShowAssert;
