'use strict'

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

  describe('static getters', function () {
    describe('get#first', function () {
      describe('no records', function () {
        it('returns null', function () {
          return assert.eventually.equal(User.first, null);
        });
      });

      describe('two records', function () {
        beforeEach(makeTwoRecords);

        it('returns the first record', function () {
          return assert.eventually.propertyVal(User.first, 'name', 'Jon');
        });
      });
    });

    describe('get#last', function () {
      describe('no records', function () {
        it('returns null', function () {
          return assert.eventually.equal(User.last, null);
        });
      });

      describe('two records', function () {
        beforeEach(makeTwoRecords);

        it('returns the last record', function () {
          return assert.eventually.propertyVal(User.last, 'name', 'Zivi');
        });
      });
    });
  });
});

function makeTwoRecords () {
  return new User({ name: 'Jon' }).save().then(function () {
    return new User({ name: 'Zivi' }).save();
  });
}
