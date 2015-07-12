# synth-db

An ORM for Node and SQL databases. Heavily inspired by [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html)

Requires Node 0.12 or IO.js so it can make use of ES6/ES2015 features of JavaScript.

Being developed readme first (tests second). There's no implementation yet.

## Install

```
npm install --save synth-db
```

## API

### init

Initialize synth-db so it can connect to your db.

```
var sdb = require('synth-db').init('postgres://localhost');
```

The init function, if successful, returns a connection to the db. This object is
the one to be used in the rest of the readme.

The connection is made using [knex](https://github.com/tgriesser/knex). You can access the knex connection directly with `sdb.knex`.

### Declaring Models

Create a model and have it extend

```javascript
var sdb = require('synth-db').init('postgres://localhost');

class User extends sdb.Base {
  constructor () {
    super();
  }
}
```

The above will look to the database for a `users` table, and add setters and getters for each column detected.

What can you do with a model? You can use it to find records from the table is represents.

### Querying

#### .find(id:string|number):SdbRecord

.find takes in the primary key used to look up a record. The `id` field will be used for lookups. A promise to the record is returned, if no record is found, the promise will be rejected.

```javascript
var userId = 1235;
User.find(userId).then(function (currentUser) {
  console.log(`Email: ${currentUser.email}`);
}, function () {
  console.log("Sorry, no record was found");
});
```

#### .where([equalities:object]|[searchString:string][, ...vars]):SdbRelation

.where can either take an equalities object or a search string. The equality object is a set of keys and values that need to all be true for a record to be included.

Alternatively, you can pass in a search string that will be passed through to the db. Don't put user provided data into the search string, instead insert a `?` into the string, and pass the data as an extra argument, this will avoid SQL injection attacks.

```javascript
var query = User.where({ confirmed: true });
// or
query = User.where('confirmed = ?', true);
query.toString(); // "select * from users where confirmed = true;"
// Only once .then is called on a relation is the db hit
query.then(function (users) {
  return user.email;
});
```
