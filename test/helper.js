"use strict";
var mocha = require('mocha');
var expect = require('chai').expect;
var deepExtend = require('deep-extend');

var Helper = {
    designs: {
        "foo": {
            "views": {
                "comments": {
                    "map": "function (doc) { emit(doc._id, doc); }",
                    "reduce": "function (keys, values, rereduce) { return sum(values); }"
                },
                "all-comments": {
                    "map": "function (doc) { emit(doc._id, doc); }"
                }
            },
            "shows": {
                "post": "function (doc, req) { return doc ? 'Hello from' + doc._id + '!' : 'Hello world!'; }",
                "user": "function (doc, req) { return 'My username'; };"
            }
        },
        "bar": {
            "language": "csharp",
            "views": {}
        }
    },
    fileName: "attachment-doesnt-exist.txt",
    fileContent: "This is an example attachment.",
    id: "fake-id-doesnt-exist",
    simpleBody: { hi: "there", num: 4 },
    complexBody: { complex: 'document', num: 11, deep: { hi: "again.", arr: ["some", "values"] } }
};

Helper.triggerBgUpdate = (db, id, changes, callback) => {
    if (!callback && changes instanceof Function) {
        callback = changes;
        changes = undefined;
    }
    db.raw.get(id, (err, body) => {
        expect(err).to.be.falsy;
        deepExtend(body, changes || { a: 'change' });
        let oldRev = body['_rev'];
        expect(oldRev).to.be.ok;
        db.raw.insert(body, (err, body) => {
            expect(err).to.be.falsy;
            expect(body['rev']).to.be.ok;
            expect(body['rev']).to.not.equal(oldRev);
            callback(err, body);
        });
    });
};

Helper.triggerBgDesignUpdate = (db, designId, callback) => {
    Helper.triggerBgUpdate(db, "_design/" + designId, { shows: { "cats": "function (doc, req) { return 'yo'; }" } }, callback);
}

Helper.checkList = (list, asserts) => {
    for (let i = 0; i < asserts.length; i++) {
        let doc = list.doc(i);
        Helper.checkIncompleteBody(doc, asserts[i]);
        if (asserts['_rev'])
            expect(doc.getRev()).to.eql(asserts['_rev']);
    }
};

Helper.checkIncompleteBody = (doc, asserts) => {
    for (let key in asserts) {
        if (key == "_attachments")
            expect(Object.keys(doc.body[key])).to.eql(Object.keys(asserts[key]));
        else if (key != "_rev")
            expect(doc.body[key]).to.eql(asserts[key]);
    }
};

Helper.checkBody = (doc, asserts, done) => {
    Helper.checkIncompleteBody(doc, asserts);
    expect(asserts['_rev']).to.not.equal(doc.getRev());
    doc.db.doc.read(doc.getId(), (err, gotDoc) => {
        expect(err).to.be.undefined;
        expect(gotDoc).to.be.ok;
        expect(gotDoc.body).to.eql(doc.body);
        done();
    });
};

Helper.bufferToString = (buf) => {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
};

Helper.streamToString = (stream, callback) => {
    let chunks = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });
    stream.on('end', () => {
        if (callback)
            callback(chunks.join(''));
    });
};

module.exports = Helper;
