"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;

var dbName = 'nano-records-db-test';

var Helper = require('../helper');
var NanoRecords = require('../../dist/nano-records');
var nano = require('nano')("http://127.0.0.1:5984/");
var db;

describe('db', () => {
  after((done) => {
    db.destroy('_DESTROY_', () => { done(); });
  });
  
  describe('instance does not exist', () => {
    beforeEach(() => {
      db = undefined;
    });
    
    it('constructor', () => {
      // should be successful
      db = new NanoRecords(nano, dbName);
      expect(db.nano).to.equal(nano);
      expect(db.dbName).to.equal(dbName);
      expect(db.designs).to.eql({});
      expect(db.raw).to.respondTo('insert'); // is a nano instance
    });
    
    it('constructor with designs', () => {
      // should be successful
      db = new NanoRecords(nano, dbName, Helper.designs);
      expect(db.nano).to.equal(nano);
      expect(db.dbName).to.equal(dbName);
      expect(db.designs).to.have.all.keys("foo", "bar");
      
      expect(db.designs["foo"]).to.have.all.keys("language", "views", "shows");
      expect(db.designs["foo"]["language"]).to.equal("javascript");
      expect(db.designs["foo"]["views"]).to.have.all.keys("comments", "all-comments");
      expect(db.designs["foo"]["views"]["comments"]).to.have.all.keys("map", "reduce");
      expect(db.designs["foo"]["shows"]).to.have.all.keys("post", "user");
      
      expect(db.designs["bar"]).to.have.all.keys("language", "views", "shows");
      expect(db.designs["bar"]["language"]).to.equal("csharp");
      expect(db.designs["bar"]["views"]).to.eql({});
      expect(db.designs["bar"]["shows"]).to.eql({});
      expect(db.raw).to.respondTo('insert'); // is a nano instance
    });
    
  });
  describe('instance exists', () => {
    before(() => {
      db = new NanoRecords(nano, dbName);
    });
    
    describe('database does not exist', () => {
      beforeEach((done) => {
        nano.db.destroy(dbName, () => { done(); });
      });
      
      it('create', (done) => {
        // should be successful
        db.create((err) => {
          expect(err).to.be.undefined;
          done();
        });
      });
      it('destroy', (done) => {
        // should fail
        db.destroy('INCORRECT', (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("verify_failed");
          db.destroy('_DESTROY_', (err) => {
            expect(err).to.be.ok;
            expect(err.name).to.equal("no_db_file");
            done();
          });
        });
      });
      it('reset', (done) => {
        // should be successful
        db.reset('INCORRECT', (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("verify_failed");
          db.reset('_RESET_', (err) => {
            expect(err).to.be.undefined;
            done();
          });
        });
      });
      
    });
    describe('database exists', () => {
      before((done) => {
        nano.db.destroy(dbName, () => {
          nano.db.create(dbName, () => { done(); });
        });
      });
      
      it('create', (done) => {
        // should fail
        db.create((err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("db_already_exists");
          done();
        });
      });
      it('destroy', (done) => {
        // should be successful
        db.destroy('INCORRECT', (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("verify_failed");
          db.destroy('_DESTROY_', (err) => {
            expect(err).to.be.undefined;
            done();
          });
        });
      });
      it('reset', (done) => {
        // should be successful
        db.reset('INCORRECT', (err) => {
          expect(err).to.be.ok;
          expect(err.name).to.equal("verify_failed");
          db.reset('_RESET_', (err) => {
            expect(err).to.be.undefined;
            done();
          });
        });
      });
      
    });
  });
  
});
