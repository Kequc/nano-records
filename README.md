Nano Records
===

Note: As of the time of this writing this code has not been run a single time, I just wrote it.

    var NanoRecords = require('nano-records');
    
    var views = {
      "foo" : {
        "map" : "function(doc){ emit(doc._id, doc._rev)}"
      }
    };
    var dbName = "my-database";
    var db = NanoRecords(nano, dbName, views);
    
    db.docs.create({ hello: "there" }, function (err, doc) {
      
      // doc.retrieveLatest(callback);
      // doc.update({ doot: "dot" }, callback);
      // doc.destroy(callback);
      
      // doc.attachment.find(name, callback);
      // doc.attachment.add(name, data, mimetype, callback);
      // stream.pipe(doc.attachment.stream(name, mimetype, callback));
      // doc.attachment.destroy(name, callback);
      
    });
    
    // db.docs.find(id, callback);
    // db.docs.update(id, data, callback);
    // db.docs.destroy(id, callback);
    
    // db.view(name, data, callback);

Ideally the software will take care of creating databases, managing views, fetching data, and recovering from problems. The first parameter in every callback is an error object or null.
