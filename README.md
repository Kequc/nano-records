Nano Records
===

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

    // db.find(id, callback);
    // db.update(id, data, callback);
    // db.destroy(id, callback);
    // db.view(name, data, callback);

Ideally the software will take care of creating databases, managing views, fetching data, and recovering from problems. The first parameter in every callback is an error object or null.
