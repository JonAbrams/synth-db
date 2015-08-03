'use strict'

let assert = require('assert');
let Base = require('../lib/base');
let testdb = require('./testdb');
let knex = testdb.knex;

Base.setKnex(knex);

beforeEach(function () {
  return testdb.refresh();
});

describe('init', function () {
  it('has a users table', function () {
    return knex.schema.hasTable('users').then(function (exists) {
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
        assert.deepEqual(
          Object.keys(User.attributes).sort,
          ['id', 'name', 'created_at', 'updated_at'].sort
        );
      });
    });
  });

  describe('#save', function () {
    beforeEach(function () {
      return User.init();
    });

    it('adds a record', function () {
      let newUser = new User({ name: 'jon' });
      assert.equal(newUser.id, null);
      return newUser.save().then(user => {
        assert.equal(typeof user.id, 'number');
        assert.equal(user.name, 'jon');
        user.name = 'zivi';
        return user.save().then(user => knex('users').where({ name: 'jon' })
          .count());
      }).then(result => {
        assert.equal(parseInt(result[0].count), 0);
        return knex('users').where({ name: 'zivi' }).count();
      }).then(result => {
        assert.equal(parseInt(result[0].count), 1);
      });
    });
  });
});
