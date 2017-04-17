# synth-db

An ORM for Node and SQL databases. Heavily inspired by [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html) with a goal of being compatible with the same db that a Rails app would use.

Requires Node 0.12 or IO.js so it can make use of ES6/ES2015 features of JavaScript. Requires classes and arrow functions.

Being developed readme first (tests second). There's still lots of missing implementation.

[![Build Status](https://travis-ci.org/JonAbrams/synth-db.svg?branch=master)](https://travis-ci.org/JonAbrams/synth-db)

## Install

```
npm install --save synth-db
npm install --save knex pg      # needed too
```

## API

### init

Create a connection to your db using [knex](https://github.com/tgriesser/knex), then pass it to synth-db.

```
let knex = require('knex')('postgres://localhost/mydb');
let sdb = require('synth-db');
sdb.knex = knex;
```

synth-db is a base class that your models will extend.

### Declaring Models

Create a model and have it extend the `Base` class.

```javascript
// Assuming you called setKnex previously in the app
var sdb = require('synth-db');

class User extends sdb.Base {
  constructor () {
    super();
  }
}

/* init will populate the attributes with fields from the `users` table */
User.init().then(function () {
  return User.first;
}).then(function (user) {
  console.log(user.name);
})
```

The above will look to the database for a `users` table, and add setters and getters for each column detected.

What can you do with a model? You can use it to find records from the table is represents.

### Querying

#### .find(id:string|number):Record

.find takes in the primary key used to look up a record. The `id` field will be used for lookups. A promise to the record is returned, if no record is found, the promise will be rejected.

```javascript
var userId = 1235;
User.find(userId).then(function (currentUser) {
  console.log(`Email: ${currentUser.email}`);
}, function () {
  console.log("Sorry, no record was found");
});
```

#### .where([equalities:object]|[searchString:string][, ...vars]):Relation

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

#### .all:Array[Record]

Executes the current relation by turning it into a query, returning a promise to an array of records.

Note: Instead of using `.all` you can also use `.then()`.

```javascript
User.order('created_at').limit(10).all.then(function (users) {
  users.forEach(function (user) {
    console.log(user.name);
  });
});

// or

User.order('created_at').limit(10).then(function (users) {
  …
});
```
