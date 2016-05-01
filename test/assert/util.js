"use strict";
var mocha  = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var fileName = "attachment-doesnt-exist.txt";

var Util = {
  fileName: "attachment-doesnt-exist.txt",
  fileContent: "This is an example attachment.",
  id: "fake-id-doesnt-exist",
  simpleBody: { hi: "there" },
  complexBody: { complex: 'document', num: 11, deep: { hi: "again.", arr: ["some", "values"] } }
};

Util.triggerBgUpdate = (db, id, changes, callback) => {
  if (!callback && changes instanceof Function) {
    callback = changes;
    changes = undefined;
  }
  db.get(id, (err, body) => {
    expect(err).to.be.falsy;
    deepExtend(body, changes || { a: 'change' });
    var oldRev = body['_rev'];
    expect(oldRev).to.be.ok;
    db.insert(body, (err, body) => {
      expect(err).to.be.falsy;
      expect(body['rev']).to.be.ok;
      expect(body['rev']).to.not.equal(oldRev);
      callback(err, body);
    });
  });
};

Util.checkBody = (doc, asserts, done) => {
  for (let key in asserts) {
    if (key == "_attachments")
      expect(Object.keys(doc.body[key])).to.eql(Object.keys(asserts[key]));
    else if (key != "_rev")
      expect(doc.body[key]).to.eql(asserts[key]);
  }
  expect(asserts['_rev']).to.not.equal(doc.getRev());
  doc.db.doc.read(doc.getId(), (err, gotDoc) => {
    expect(err).to.be.undefined;
    expect(gotDoc).to.be.ok;
    expect(gotDoc.body).to.eql(doc.body);
    done();
  });
};

Util.streamToString = (stream, callback) => {
  var chunks = [];
  stream.on('data', (chunk) => {
    chunks.push(chunk);
  });
  stream.on('end', () => {
    if (callback)
      callback(chunks.join(''));
  });
};

module.exports = Util;
