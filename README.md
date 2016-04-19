Nano Records
===

A [nodejs](https://nodejs.org) utility for interacting with [couchdb](http://couchdb.apache.org) through [nano](https://github.com/dscape/nano). Each NanoRecords instance represents one database. This is a simple way to get up and running with couchdb.

Abstract away some of the database busywork and make your life easier.

## &#8620; Usage

```javascript
var nano = require('nano')("localhost");
var NanoRecords = require('nano-records');

var dbName = "my-database";
var db = new NanoRecords(nano, dbName);
```

Provide NanoRecords with a running instance of nano and a chosen database name. This should be all you need to get up and running.

## &#8620; Documents

#### Persist

```javascript
db.doc.persist(body, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body());
});
```

The easiest way to insert a record into to the database and instantiate a NanoRecords document representing that data. You may optionally provide an `_id` attribute in the body however be careful if that document exists in the database this method overwrites it.

#### Get

```javascript
db.doc.get(id, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body());
});
```

Perfect way to retrieve your data again from the database.

#### Update

```javascript
doc.update(body, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.update(id, body, (err) => {
  if (!err)
    console.log('success!');
});
```

Updates the database record with the provided body.

#### Update or persist

```javascript
db.doc.updateOrPersist(id, body, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body());
});
```

This method first looks up the document and if it exists, updates it.

Otherwise, it will persist a document with the given id. You will be certain to avoid overwriting entire documents this way, this method also returns a NanoRecords document.

#### Erase

```javascript
doc.erase((err) => {
  if (!err)
    console.log('success!');
});
db.doc.erase(id, (err) => {
  if (!err)
    console.log('success!');
});
```

Destroys the document in the database, returns an error unless the document was found and erased.

#### Body

```javascript
var body = doc.body();
var att1 = doc.body('my-attribute');
var att2 = doc.body('my-attribute', 'my-nested-attribute');
```

A copy of your data can be accessed using the body method, optionally you can pass a series of parameters to drill into toward the attribute you want instead.

#### Get id and get rev

```javascript
// doc.body('_id');
var id = doc.getId();
// doc.body('_rev');
var rev = doc.getRev();
```

Methods for accessing the body's `_id` and `_rev` properties. Equivalent to running the `doc.body('_id')` and `doc.body('_rev')`.

#### Retrieve latest

```javascript
doc.retrieveLatest((err) => {
  if (err)
    return;
  console.log(doc.body());
});
```

Retrieves latest version of the document from the database.

## &#8620; Attachments

#### List and exists

```javascript
var list = doc.attachment.list();
var exists = doc.attachment.exists(name);
```

Returns a list of all attachments, or given the provided name whether this record has an attachment with a matching.

#### Persist

```javascript
doc.attachment.persist(name, data, mimeType, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.attachment.persist(id, name, data, mimeType, (err) => {
  if (!err)
    console.log('success!');
});
```

Easiest way to add a new attachment to a document, be aware if the provided name exists the attachment will be overwritten.

#### Get

```javascript
doc.attachment.get(name, (err, data) => {
  if (err)
    return;
  console.log(data.length);
});
db.doc.attachment.get(id, name, (err, data) => {
  if (err)
    return;
  console.log(data.length);
});
```

Gets an attachment from the database.

#### Erase

```javascript
doc.attachment.erase(name, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.attachment.erase(id, name, (err) => {
  if (!err)
    console.log('success!');
});
```

Destroys the attachment in the database, returns an error unless the attachment was found and erased.

## &#8620; Streams

#### Write

```javascript
var reader = fs.createReadStream('./my-file.txt');
var writer = doc.attachment.write(name, (err) => {
  if (!err)
    console.log('success');
});
// upload to the database
reader.pipe(writer);
```

It is important to note streams are not retried if there is an error you will have to pipe in a new stream yourself.

#### Read

```javascript
var writer = fs.createWriteStream('./my-file.txt');
var reader = doc.attachment.read(name, (err) => {
  if (!err)
    console.log('success');
});
var reader = db.doc.attachment.read(id, name, (err) => {
  if (!err)
    console.log('success');
});
// download from the database
reader.pipe(writer);
```

Reads the attachment as a stream. How convenient!

## &#8620; Designs

```json
// > ./designs/my-db/foo.json
{
  "views": {
    "comments": {
      "map": "function (doc) { ... };",
      "reduce": "function (keys, values, rereduce) { ... };"
    }
  },
  "shows": {
    "post": "function (doc, req) { ... };"
  }
}
```
```json
// > ./designs/my-db/bar.json
{
  "language": "javascript",
  "views": {}
}
```
```javascript
var designs = {
  foo: require('./designs/my-db/foo.json'),
  bar: require('./designs/my-db/bar.json')
};
var db = new NanoRecords(nano, dbName, designs);
```

When creating your NanoRecords instance optionally provide it a set of designs to use. By default the language will be javascript.

#### View

```javascript
db.design.view(designId, viewName, params, (err, data) => {
  if (err)
    return;
  console.log(data);
});
```

Persists the given view denoted using the provided `designId` (ie. 'foo') to the database if it's not already there, then returns the result.

#### Show

```javascript
db.design.show(designId, showName, id, (err, data) => {
  if (err)
    return;
  console.log(data);
});
```

Persists the given show to the database and behaves very similarly to `db.design.view`.

## &#8620; Contribute

If you like what you see please feel encouraged to [get involved](https://github.com/Kequc/nano-records/issues) patches and pull requests! As of the time of this writing the project is still new.
