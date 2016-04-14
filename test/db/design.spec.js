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
var dbName = 'nano-records-db-design-test';

var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var forced = nano.use(dbName);
var db = new NanoRecords(nano, dbName, designs);

function forceUpdate (doc, data, callback) {
  forced.get(doc.body['_id'], function (err, body) {
    deepExtend(body, data);
    forced.insert(body, callback);
  });
}

describe('db-design', function () {
  it('view creates a new design document');
  it('view adds new');
  it('view');
  it('view retries');
  it('view more than maxTimes should fail');
  it('view does not exist should fail');
  it('show creates a new design document');
  it('show adds new');
  it('show');
  it('show retries');
  it('show more than maxTimes should fail');
  it('show does not exist should fail');
});
