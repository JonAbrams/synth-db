'use strict'

let assert = require('assert');
let Base = require('../lib/base');
let testdb = require('./testdb');

Base.setKnex(testdb.knex);

beforeEach(function () {
  return testdb.refresh();
});

describe('init', function () {
  it('has a users table', function () {
    return testdb.knex.schema.hasTable('users').then(function (exists) {
      assert(exists);
    })
  });
});

describe('Base', function () {
  let User;
  beforeEach(function () {
    User = class User extends Base {};
  });

  describe('.resetColumnInformation', function () {
    it('populates attributes', function () {
      assert.equal(User.attributes, null);
      return User.resetColumnInformation().then(function () {
        assert.deepEqual(Object.keys(User.attributes), ['id', 'name', 'created_at', 'updated_at']);
      });
    });
  });
});
