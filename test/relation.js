'use strict';

let testdb = require('./testdb');
let Base = require('../lib/base');
let knex = Base.knex = testdb.knex;
let Relation = require('../lib/relation');

let User = null;

beforeEach(function () {
   User = class User extends Relation {}
  return testdb.refresh();
});

describe('Relation', function () {
  it('has a default query', function () {
    assert.equal(new User().toSql(), 'select * from "users"');
  });

  describe('static getters', function () {
    describe('get#first', function () {
      describe('no records', function () {
        it('returns null', function () {
          return assert.eventually.equal(User.first, null);
        });
      });

      describe('many records', function () {
        beforeEach(makeRecords);

        it('returns the first record', function () {
          return assert.eventually.propertyVal(User.first, 'name', 'John');
        });
      });
    });

    describe('get#last', function () {
      describe('no records', function () {
        it('returns null', function () {
          return assert.eventually.equal(User.last, null);
        });
      });

      describe('many records', function () {
        beforeEach(makeRecords);

        it('returns the last record', function () {
          return assert.eventually.propertyVal(User.last, 'name', 'Ringo');
        });
      });
    });
  });

  describe('#order', function () {
    beforeEach(makeRecords);

    it('orders by id', function () {
      return assert.eventually.propertyVal(User.order('id').first, 'name', 'John');
    });

    it('orders by name', function () {
      return assert.eventually.propertyVal(User.order('name').first, 'name', 'George');
    });

    it('orders by name desc', function () {
      return assert.eventually.propertyVal(User.order('name desc').first, 'name', 'Ringo');
    });
  });
});

function makeRecords () {
  let names = ['John', 'Paul', 'George', 'Ringo']

  return (function addUser () {
    if (names.length === 0) return;
    return knex.table('users').insert({ name: names.shift() }).then(addUser);
  })();
}
