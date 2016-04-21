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

#### Create

```javascript
db.doc.create(body, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body);
});
```

This is the easiest way to create a record in the database, returns a NanoRecords document representing that new record, `_id` is generated automatically.

#### Read

```javascript
db.doc.read(id, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body);
});
```

Perfect way to retrieve your data once it is in the database.

#### Head

```javascript
doc.head((err, data) => {
  if (err)
    return;
  console.log(data);
});
db.doc.head(id, (err, data) => {
  if (err)
    return;
  console.log(data);
});
```

Retrieves header data.

#### Write

```javascript
doc.write(body, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.write(id, body, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body);
});
```

Replaces content of the document with body, in the second case creates a new record if one doesn't exist.

#### Update

```javascript
doc.update(body, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.update(id, body, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body);
});
```

Adds the provided body to the existing body and then saves it to the database, in the second case creates a new record if one doesn't exist.

#### Destroy

```javascript
doc.destroy((err) => {
  if (!err)
    console.log('success!');
});
db.doc.destroy(id, (err) => {
  if (!err)
    console.log('success!');
});
```

Removes the document from the database.

#### Body

```javascript
// doc.body;
var body = doc.getBody();
```

A convenient method used to clone of your data. Data is also available directly however it is not a good idea to change it.

#### Get id and get rev

```javascript
doc.getId() == doc.body['_id']; // true
doc.getRev() == doc.body['_rev']; // true
```

Methods for accessing the body's `_id` and `_rev` properties. Equivalent to `doc.body['_id']` and `doc.body['_rev']`.

#### Retrieve latest

```javascript
doc.retrieveLatest((err) => {
  if (err)
    return;
  console.log(doc.body);
});
```

Retrieves latest version from the database.

## &#8620; Attachments

#### Write

```javascript
doc.attachment.write(name, data, mimeType, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.attachment.write(id, name, data, mimeType, (err) => {
  if (!err)
    console.log('success!');
});
```

Easiest way to save an attachment to a document, be aware if the name exists the attachment will be overwritten. In the second case creates a new record if one doesn't exist.

#### Read

```javascript
doc.attachment.read(name, (err, data) => {
  if (err)
    return;
  console.log(data.length);
});
db.doc.attachment.read(id, name, (err, data) => {
  if (err)
    return;
  console.log(data.length);
});
```

Reads an attachment from the database.

#### Destroy

```javascript
doc.attachment.destroy(name, (err) => {
  if (!err)
    console.log('success!');
});
db.doc.attachment.destroy(id, name, (err) => {
  if (!err)
    console.log('success!');
});
```

Removes the attachment from the database.

#### List and exists

```javascript
var list = doc.attachment.list();
var exists = doc.attachment.exists(name);
```

Returns a list of all attachments or whether a specific attachment exists.

## &#8620; Streams

#### Reader

```javascript
var writer = fs.createWriteStream('./my-file.txt');
var reader = doc.attachment.reader(name, (err) => {
  if (!err)
    console.log('success!');
});
reader.pipe(writer);
var writer = fs.createWriteStream('./my-file.txt');
var reader = db.doc.attachment.reader(id, name, (err) => {
  if (!err)
    console.log('success!');
});
reader.pipe(writer);
```

Reads the attachment as a stream. How convenient!

#### Writer

```javascript
var reader = fs.createReadStream('./my-file.txt');
var writer = doc.attachment.writer(name, (err) => {
  if (!err)
    console.log('success!');
});
reader.pipe(writer);
```

Important to note that streams cannot be retried, if there is an error you will have to pipe a new stream yourself.

## &#8620; Designs

```json
// > ./designs.json
{
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
}
```
```javascript
var designs = require('./designs.json');
var db = new NanoRecords(nano, dbName, designs);
```

When creating your NanoRecords instance optionally provide it a set of designs to use. You can read more about [views](http://docs.couchdb.org/en/1.6.1/couchapp/views/intro.html), shows, and [design documents](http://docs.couchdb.org/en/1.6.1/couchapp/ddocs.html) on the couchdb website.

#### View

```javascript
db.design.view(designId, viewName, params, (err, data) => {
  if (err)
    return;
  console.log(data);
});
```

Persists the given view using the provided `designId` (ie. 'foo') to the database if it's not already there, then returns the result.

#### Show

```javascript
db.design.show(designId, showName, id, (err, data) => {
  if (err)
    return;
  console.log(data);
});
```

Persists the given show to the database and behaves similarly to `db.design.view`.

## &#8620; Db

#### Create

```javascript
db.create("CREATE_", (err) => {
  if (!err)
    console.log('success!');
});
```

Creates the database, first parameter must equal `CREATE_`. You should never need to use this but it's there if you want it.

#### Destroy

```javascript
db.destroy("DESTROY_", (err) => {
  if (!err)
    console.log('success!');
});
```

Destroys the database, first parameter must equal `DESTROY_`.

#### Reset

```javascript
db.reset("RESET_", (err) => {
  if (!err)
    console.log('success!');
});
```

Destroys and then creates the database, first parameter must equal `RESET_`.

## &#8620; Errors

```javascript
err.scope; // source of the error
err.name; // error code
err.message; // more information
err.raw; // the full error returned from nano

// common errors
// ==
// not_found: Not found.
// missing_id: Id parameter required.
// conflict: There was a conflict.
// malformed_script: Problem with one of your designs.
// no_db_file: Database missing.
```

When an error is returned it has the above format. Generally you should never see `no_db_file` or `conflict` so maybe these are not so common errors.

A conflict would only happen if the max number of retries was reached on a request, possibly you have too much activity on one specific document.

You might see database missing if your couchdb has security locked down.

## &#8620; Contribute

If you like what you see please feel encouraged to [get involved](https://github.com/Kequc/nano-records/issues) report problems and submit pull requests! As of the time of this writing the project is still new.
