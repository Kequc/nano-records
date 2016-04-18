"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;

var dbName = 'nano-records-db-doc-attachment-test';

var NanoRecords = require('../../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db = new NanoRecords(nano, dbName);

describe('db-doc-attachment', () => {

  describe('database does not exist', () => {
    beforeEach((done) => {
      nano.db.destroy(dbName, () => { done(); });
    });
    
    it('persist');
    it('get');
    it('read');
    it('destroy');
    
  });
  
  describe('database exists', () => {
    before((done) => {
      nano.db.destroy(dbName, () => {
        nano.db.create(dbName, () => { done(); });
      });
    });
    
    describe('document does not exist', () => {
      
      it('persist');
      it('get');
      it('read');
      it('destroy');
      
    });
    
    describe('document exists', () => {
      
      it('persist');
      it('persist retries');
      it('persist more than maxTimes should fail');
      it('get');
      it('read');
      it('destroy');
      it('destroy retries');
      it('destroy more than maxTimes should fail');
      
    });
  });
});
