Nano Records
===

Note: As of the time of this writing this code has not been run a single time, I just wrote it.

    var NanoRecords = require('nano-records');
    var nano = require('nano')(credentials);
    
    var views = {
      "foo" : {
        "map" : "function(doc){ emit(doc._id, doc._rev)}"
      }
    };
    var dbName = "my-database";
    var db = new NanoRecords(nano, dbName, views);
    
    db.doc.create({ hello: "there" }, function (err, doc) {
      
      // doc.data;
      
      // doc.retrieveLatest(callback);
      // doc.update({ doot: "dot" }, callback);
      // doc.destroy(callback);
      
      // doc.attachment.add(name, data, mimetype, callback);
      // stream.pipe(doc.attachment.stream(name, mimetype, callback));
      // doc.attachment.find(name, callback);
      // doc.attachment.destroy(name, callback);
      
    });
    
    // db.doc.find(id, callback);
    // db.doc.update(id, data, callback);
    // db.doc.destroy(id, callback);
    
    // db.view(name, data, callback);

Ideally the software will take care of creating databases, managing views, fetching data, and recovering from problems. The first parameter in every callback is an error object or null.

### Usage

    var db = new NanoRecords(nano, dbName, views);

A new instance of NanoRecords takes your running nano, a chosen database name, and optional set of views. This command will do nothing on its own just construct an instance, no database is created, no views are saved, anything like that.

    db.doc.create(data, cb[err, doc]);

Create a document with the given data, you may choose to include a custom `_id` attribute here if you wish. This command will create a database if it's missing, then persist a new document, and run the given callback with an error and undefined, or null and a NanoRecords document.

    db.doc.find(id, cb[err, doc]);

Find a document using the given id if it exists, will run the given callback with an error and undefined, or null and a NanoRecords document.

    db.doc.destroy(id, cb[err, bool]);

Attempt to destroy a document using the given id if it exists, will run the given callback with an error and undefined, or null and true.

    db.view(name, data, cb[err, data]);

This will run one of your provided views and return the result. It will create a design document if one doesn't exist, append the requested view if it is missing. Then the callback will return an error and undefined, or null and your data set.

    doc.data;

Every NanoRecords document maintains a data attribute with last known information.

    doc.retrieveLatest(cb[err, bool]);

Get the latest version from the database, callback will return an error and undefined, or null and true.

    doc.update(data, cb[err, bool]);

Update document with the given data. Will attempt to use available data but will retrieve the latest version if needed before persisting. Callback returns an error and undefined, or null and true.

    doc.destroy(cb[err, bool);

Destroy document, will run the given callback with an error and undefined, or null and true.

    doc.attachment.add(name, data, mimeType, cb[err, bool]);

Add an attachment with the given name, using the provided data and mimeType, will run the given callback with an error and undefined, or null and true.

    stream.pipe(doc.attachment.stream(name, mimeType, cb[err, bool]));

You may choose to add an attachment to the document using a stream, however in this case retries will not be attempted. In case of an error you will have to manage piping a new stream yourself. Callback returns an error and undefined, or null and true.

    doc.attachment.find(name, cb[err, data]);

Find an attachment on the document if it exists, run the given callback with an error and undefined, or null and your attachment.

    doc.attachment.destroy(name, cb[err, bool]);

Destroy the attachment if it exists, run the given callback with an error and undefined, or null and true.

