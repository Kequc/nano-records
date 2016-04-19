"use strict";
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
      "post": "function (doc, req) { ... };",
      "user": "function (doc, req) { ... };"
    }
  },
  "bar": {
    "language": "csharp",
    "views": {}
  }
};
var dbName = 'nano-records-db-test';

var NanoRecords = require('../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");

describe('db', function () {
  
  it('instantiates a new db object', () => {
    // should be successful
    let db = new NanoRecords(nano, dbName);
    expect(db.nano).to.equal(nano);
    expect(db.dbName).to.equal(dbName);
    expect(db.designs).to.eql({});
    expect(db.raw).to.respondTo('insert'); // is a nano instance
  });
  
  it('instantiates a new db object with designs', () => {
    // should be successful
    let db = new NanoRecords(nano, dbName, designs);
    expect(db.nano).to.equal(nano);
    expect(db.dbName).to.equal(dbName);
    expect(db.designs).to.have.all.keys("foo", "bar");
    
    expect(db.designs["foo"]).to.have.all.keys("language", "views", "shows");
    expect(db.designs["foo"]["language"]).to.equal("javascript");
    expect(db.designs["foo"]["views"]).to.have.all.keys("comments");
    expect(db.designs["foo"]["views"]["comments"]).to.have.all.keys("map", "reduce");
    expect(db.designs["foo"]["shows"]).to.have.all.keys("post", "user");
    
    expect(db.designs["bar"]).to.have.all.keys("language", "views", "shows");
    expect(db.designs["bar"]["language"]).to.equal("csharp");
    expect(db.designs["bar"]["views"]).to.eql({});
    expect(db.designs["bar"]["shows"]).to.eql({});
    expect(db.raw).to.respondTo('insert'); // is a nano instance
  });
  
  it('create');
  
});
