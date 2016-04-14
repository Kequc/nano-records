var mocha  = require('mocha');
var expect = require('chai').expect;

var designs = {
  "foo": {
    "views": {
      "comments": {
        "map": "function (doc) { ... };",
        "reduce": "function (keys, values, rereduce) { ... };"
      }
    },
    "shows": {
      "post": "function (doc, req) { ... };"
    },
    "lists": {
      "by_title": "function (head, req) { ... };"
    }
  },
  "bar": {
    "language": "javascript",
    "views": {}
  }
};
var dbName = 'nano-records-db-test';

var NanoRecords = require('../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName, designs);

describe('db', function () {
  it('creates a new db object');
  it('creates a new db object with designs', function () {
    // expect(db.nano).to.equal(nano);
    // expect(db.dbName).to.equal(dbName);
    // expect(db.designs).to.have.all.keys("foo", "bar");
    // expect(db.designs["foo"]).to.have.all.keys("language", "views", "shows");
    // expect(db.designs["bar"]).to.have.all.keys("language", "views", "shows");
    // expect(db.raw).to.respondTo('insert'); // is a nano instance
  });
});
