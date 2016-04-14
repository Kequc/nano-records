var mocha  = require('mocha');
var expect = require('chai').expect;

var dbName = 'nano-records-db-doc-attachment-test';

var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

describe('db-doc-attachment', function () {
  it('add');
  it('add retries');
  it('add more than maxTimes should fail');
  it('add does not exist should fail');
  it('get');
  it('get does not exist should fail');
  it('read');
  it('read does not exist should fail');
  it('destroy');
  it('destroy retries');
  it('destroy more than maxTimes should fail');
  it('destroy does not exist should fail');
});
