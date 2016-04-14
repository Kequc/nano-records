Nano Records
===

A NanoRecords document is useful in making the fewest requests possible to the database and abstracting retries, views, or other database busy work away from you. This is a quick way to get up and running with couchdb. If it finds that the current revision is out of date on any document it will retrieve the latest from the database and try again a maximum of a few times.

Note: As of the time of this writing this code has not been run in production, I just wrote it. Tests are missing for attachments and views but otherwise this seems to work in its current state.

```javascript
var NanoRecords = require('nano-records');

var nano = require('nano')("localhost");
var dbName = "my-database";
var designs = {
  "foo": {
    "views": {
      "comments": {
        "map": "function (doc) { ... };",
        "reduce": "function (keys, values, rereduce) { ... };"
      }
    },
    "shows": {
      "post": "function (doc, req) { ... };"
    }
  },
  "bar": {
    "language": "javascript",
    "views": {}
  }
};

var db = new NanoRecords(nano, dbName, designs);

db.doc.create({ hello: "there" }, function (err, doc) {
  
  // doc.body;
  
  // doc.getId();
  // doc.getRev();
  
  // doc.retrieveLatest(callback);
  // doc.update({ doot: "dot" }, callback);
  // doc.destroy(callback);
  
  // doc.attachment.exists(name);
  // doc.attachment.add(name, data, mimeType, callback);
  // doc.attachment.get(name, callback);
  // doc.attachment.destroy(name, callback);

  // stream.pipe(doc.attachment.write(name, mimeType, callback));
  // doc.attachment.read(name, callback).pipe(stream);
  
});

// db.doc.update(id, { doot: "dot" }, callback);
// db.doc.destroy(id, callback);

// db.doc.get(id, callback);
// db.doc.updateOrCreate(id, { doot: "dot" }, callback);

// db.doc.attachment.add(id, name, data, mimeType, callback);
// db.doc.attachment.get(id, name, callback);
// db.doc.attachment.destroy(id, name, callback);

// db.doc.attachment.read(id, name).pipe(stream);

// db.design.view(designId, viewName, params, callback);
// db.design.show(designId, showName, id, callback);
```

### Usage

```typescript
var db = new NanoRecords(nano: NanoInstance, dbName: string, designs?: DesignSet);
```

A new instance of NanoRecords takes your running nano, a chosen database name, and optional set of designs. This command will do nothing on its own just construct an instance, no database is created, no design documents are persisted, or anything like that.

### create / get / updateOrCreate

```typescript
db.doc.create(body: Object, callback?: (err?: Error, doc?: Doc) => any);
```

Create a document you may choose to include a custom `_id` attribute here if you wish. This command will create a database if it's missing, then persist a new document, then run the given callback with an error and undefined, or null and a NanoRecords document.

```typescript
db.doc.get(id: string, callback?: (err?: Error, doc?: Doc) => any);
```

Find a document, callback returns an error and undefined, or null and a NanoRecords document.

```typescript
db.doc.updateOrCreate(id: string, body: Object, callback?: (err?: Error, doc?: Doc) => any);
```

Find a document if it exists and update it, if the document doesn't exist then create it. Callback will run with an error and undefined, or null and the NanoRecords document.

### NanoRecords document

```typescript
doc.body: Object;
```

Each maintains a body Object with last known version from the database.

```typescript
doc.getId(): string;
doc.getRev(): string;
```

Returns the document's `_id` or `_rev` attribute if it exists or null.

```typescript
doc.retrieveLatest(callback?: (err?: Error) => any);
```

Get the latest from the database, callback will return an error or null.

```typescript
doc.update(body: Object, callback?: (err?: Error) => any);
```

Update document by merging the given body. Will attempt to use the document's available body Object however retrieves the latest version from the database if needed. Callback returns an error or null.

```typescript
doc.destroy(callback?: (err?: Error) => any);
```

Destroy document it will run the given callback with an error or null.

### Attachments

```typescript
doc.attachment.exists(name: string): boolean;
```

Returns whether the document has an attachment with the given name.

```typescript
doc.attachment.add(name: string, data: any, mimeType: string, callback?: (err?: Error) => any);
```

Add an attachment with the given name using the provided data and mimeType, it will run the given callback with an error or null.

```typescript
doc.attachment.get(name: string, callback?: (err?: Error, data?: any) => any);
```

Get an attachment from the database if it exists on this document, it will run the given callback with an error and undefined, or null and your attachment.

```typescript
doc.attachment.destroy(name: string, callback?: (err?: Error) => any);
```

Destroy an attachment it will run the given callback with an error or null.

### Streams

```typescript
stream.pipe(doc.attachment.write(name: string, mimeType: string));
```

You may choose to add an attachment to the document using streams, however in this case retries will not be attempted. In case of an error you will have to manage piping a new stream yourself.

```typescript
doc.attachment.read(name: string).pipe(stream);
```

You may choose to get an attachment from the document using streams.

### Shorthand

These methods are the same as their counterparts above but allow you to provide an id directly rather than running `db.doc.get` first.

```typescript
db.doc.update(id: string, body: Object, callback?: (err?: Error) => any);
db.doc.destroy(id: string, callback?: (err?: Error) => any);

db.doc.attachment.add(id: string, name: string, data: any, mimeType: string, callback?: (err?: Error) => any);
db.doc.attachment.get(id: string, name: string, callback?: (err?: Error, data?: any) => any);
db.doc.attachment.destroy(id: string, name: string, callback?: (err?: Error) => any);

db.doc.attachment.read(id: string, name: string).pipe(stream);
```

### Views

```typescript
var callback = (err?: Error, data?: Object) => any;
db.design.view(designId: string, viewName: string, params: Object, callback?: callback);
db.design.show(designId: string, showName: string, id: string, callback?: callback);
```

This will run one of your provided design views or shows and return the result. It will create a design document with the provided designId if one doesn't exist, append the requested view if it is missing. Then the callback will return an error and undefined, or null and your data set.
