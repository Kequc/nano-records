Nano Records
===

Utility returns objects for interacting with couchdb.

Note: As of the time of this writing this code has not been run a single time, I just wrote it.

    var NanoRecords = require('nano-records');

    var views = {
    };

    var dbName = "my-database";
    var db = NanoRecords(nano, dbName, views);

    db.create({ hello: "there" }, function (err, _) {
      var myInstance = _;
      
      // myInstance.fetch(callback);
      // myInstance.update({ doot: "dot" }, callback);
      // myInstance.destroy(callback);
      // myInstance.attachmentAdd(name, data, mimetype, callback);
      // stream.pipe(myInstance.attachmentAdd(name, null, mimetype, callback));
      // myInstance.attachmentGet(name, callback);
      // myInstance.attachmentRemove(name, callback);
    });

    // db.update(id, data, callback);
    // db.find(id, callback);
    // db.view(name, data, callback);
