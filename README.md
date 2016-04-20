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
  console.log(doc.body);
});
```

This is the easiest way to insert a record into to the database, returns a NanoRecords document representing that record. You may optionally provide an `_id` attribute in the body however be careful if that document exists in the database this method will overwrite it.

#### Get

```javascript
db.doc.get(id, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body);
});
```

Perfect way to retrieve your data again once it is in the database.

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

Adds the provided body to the existing body and then persists it to the database.

#### Update or persist

```javascript
db.doc.updateOrPersist(id, body, (err, doc) => {
  if (err)
    return;
  // doc is a NanoRecords document
  console.log(doc.body);
});
```

This method searches for the document in the database and updates it if it is found.

Otherwise, it will persist it along with the given id. You will be certain to avoid overwriting entire documents this way, this method also returns a NanoRecords document instance.

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

Removes the document from the database.

#### Body

```javascript
// doc.body;
var body = doc.getBody();
```

A convenience method used to return a clone of your data. The same data is available directly however it is not a good idea to make changes to it.

#### Get id and get rev

```javascript
// doc.body['_id'];
var id = doc.getId();
// doc.body['_rev'];
var rev = doc.getRev();
```

Methods for accessing the body's `_id` and `_rev` properties. Equivalent to running `doc.body['_id']` and `doc.body['_rev']`.

#### Retrieve latest

```javascript
doc.retrieveLatest((err) => {
  if (err)
    return;
  console.log(doc.body);
});
```

Retrieves latest version of the document from the database.

## &#8620; Attachments

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

Removes the attachment from the database.

#### List and exists

```javascript
var list = doc.attachment.list();
var exists = doc.attachment.exists(name);
```

Returns a list of all attachments or whether a specific attachment exists.

## &#8620; Streams

#### Read

```javascript
var writer = fs.createWriteStream('./my-file.txt');
var reader = doc.attachment.read(name, (err) => {
  if (!err)
    console.log('success!');
});
reader.pipe(writer);
var writer = fs.createWriteStream('./my-file.txt');
var reader = db.doc.attachment.read(id, name, (err) => {
  if (!err)
    console.log('success!');
});
reader.pipe(writer);
```

Reads the attachment as a stream. How convenient!

#### Write

```javascript
var reader = fs.createReadStream('./my-file.txt');
var writer = doc.attachment.write(name, (err) => {
  if (!err)
    console.log('success!');
});
reader.pipe(writer);
```

It is important to note streams are not retried if there is an error you will have to pipe a new stream yourself.

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
db.create((err) => {
  if (!err)
    console.log('success!');
});
```

Creates the database. You should never need to use this but it's there if you need it.

#### Destroy

```javascript
db.destroy((err) => {
  if (!err)
    console.log('success!');
});
```

Destroys the database.

## &#8620; Errors

```javascript
err.scope; // source of the error
err.name; // a error code
err.message; // more information
err.raw; // the full error returned from nano

// common errors
// ==
// not_found: Not found.
// conflict: There was a conflict.
// no_db_file: Database missing.
```

When an error is returned it has the above format. Generally you should never see `no_db_file` or `conflict` so maybe these are not so common errors.

A conflict would only happen if the max number of retries was reached on a request, possibly you have too much activity on one specific document.

You might see database missing if your couchdb has security locked down.

## &#8620; Contribute

If you like what you see please feel encouraged to [get involved](https://github.com/Kequc/nano-records/issues) report problems and submit pull requests! As of the time of this writing the project is still new.
