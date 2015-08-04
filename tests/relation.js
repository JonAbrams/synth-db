'use strict'

let assert = require('assert');
let Base = require('../lib/base');
let Relation = require('../lib/base');
let testdb = require('./testdb');
let knex = testdb.knex;

Base = knex;

let User = null;

beforeEach(function () {
   User = class User extends Relation {}
  return testdb.refresh().then(() => User.init());
});

describe('Relation', function () {
  it('has a default query', function () {
    assert.equal(new User().toSql(), 'select * from "users"');
  });
});
