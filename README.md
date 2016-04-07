Nano Records
===

Note: As of the time of this writing this code has not been run in production, I just wrote it. Tests are missing for attachments and views but otherwise this seems to work in its current state.

```javascript
var NanoRecords = require('nano-records');

var nano = require('nano')("localhost");
var dbName = "my-database";
var views = {
  "foo" : {
    "map" : "function(doc){ emit(doc._id, doc._rev)}"
  }
};

var db = new NanoRecords(nano, dbName, views);

db.doc.create({ hello: "there" }, function (err, doc) {
  
  // doc.body;
  
  // doc.retrieveLatest(callback);
  // doc.update({ doot: "dot" }, callback);
  // doc.destroy(callback);
  
  // doc.attachment.add(name, data, mimeType, callback);
  // doc.attachment.get(name, callback);
  // doc.attachment.destroy(name, callback);

  // stream.pipe(doc.attachment.stream(name, mimeType, callback));
  
});

// db.doc.get(id, callback);
// db.doc.update(id, { doot: "dot" }, callback);
// db.doc.destroy(id, callback);

// db.doc.attachment.add(id, name, data, mimeType, callback);
// db.doc.attachment.get(id, name, callback);
// db.doc.attachment.destroy(id, name, callback);

// db.view(name, params, callback);
```

### Usage

```javascript
var db = new NanoRecords(nano, dbName, views);
```

A new instance of NanoRecords takes your running nano, a chosen database name, and optional set of views. This command will do nothing on its own just construct an instance, no database is created, no views are saved, anything like that.

### Create / get

```javascript
db.doc.create(body, cb[err, doc]);
```

Create a document you may choose to include a custom `_id` attribute here if you wish. This command will create a database if it's missing, then persist a new document, then run the given callback with an error and undefined, or null and a NanoRecords document.

```javascript
db.doc.get(id, cb[err, doc]);
```

Find a document, callback will return an error and undefined, or null and a NanoRecords document.

### NanoRecords document

```javascript
doc.body;
```

Each maintains a body attribute with last known version from the database.

```javascript
doc.retrieveLatest(cb[err, bool]);
```

Get the latest from the database, callback will return an error and undefined, or null and true.

```javascript
doc.update(body, cb[err, bool]);
```

Update document by merging the given body. Will attempt to use available body however will retrieve the latest version from the database if needed. Callback returns an error and undefined, or null and true.

```javascript
doc.destroy(cb[err, bool);
```

Destroy document it will run the given callback with an error and undefined, or null and true.

```javascript
doc.attachment.add(name, data, mimeType, cb[err, bool]);
```

Add an attachment with the given name using the provided data and mimeType, it will run the given callback with an error and undefined, or null and true.

```javascript
stream.pipe(doc.attachment.stream(name, mimeType, cb[err, bool]));
```

You may choose to add an attachment to the document using a stream, however in this case retries will not be attempted. In case of an error you will have to manage piping a new stream yourself, callback returns an error and undefined, or null and true.

```javascript
doc.attachment.get(name, cb[err, data]);
```

Get an attachment from the database if it exists on this document, it will run the given callback with an error and undefined, or null and your attachment.

```javascript
doc.attachment.destroy(name, cb[err, bool]);
```

Destroy an attachment it will run the given callback with an error and undefined, or null and true.

```javascript
db.view(name, params, cb[err, data]);
```

This will run one of your provided views and return the result. It will create a design document if one doesn't exist, append the requested view if it is missing. Then the callback will return an error and undefined, or null and your data set.

### Shorthand

These methods are the same as their counterparts above but assumes fetching from the database without having to run `db.doc.get` before.

```javascript
db.doc.update(id, body, cb[err, bool]);
db.doc.destroy(id, cb[err, bool]);
db.doc.attachment.add(id, name, data, mimeType, cb[err, bool]);
db.doc.attachment.get(id, name, cb[err, data]);
db.doc.attachment.destroy(id, name, cb[err, bool]);
```

### In general

A NanoRecords document is useful making the fewest requests possible to the database and abstracting retries, or other database busy work. If it finds that the current revision is out of date it will retrieve the latest version from the database and try again, a maximum of a few times.
