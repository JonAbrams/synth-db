'use strict';

let testdb = require('./testdb');
let Base = require('../lib/base');
let knex = Base.knex = testdb.knex;
let Relation = require('../lib/relation');

let User = class User extends Base {};

describe('Relation', function () {
  beforeEach(function () {
    return User.init();
  });

  it('has a default query', function () {
    assert.equal(new User().toSql(), 'select * from "users"');
  });

  describe('static getters', function () {
    describe('get#first', function () {
      describe('no records', function () {
        beforeEach(function () {
          return knex.table('users').del();
        });

        it('returns null', function () {
          return assert.eventually.equal(User.first, null);
        });
      });

      describe('many records', function () {
        it('returns the first record', function () {
          return assert.eventually.propertyVal(User.first, 'name', 'John');
        });
      });
    });

    describe('get#last', function () {
      describe('no records', function () {
        beforeEach(function () {
          return knex.table('users').del();
        });

        it('returns null', function () {
          return assert.eventually.equal(User.last, null);
        });
      });

      describe('many records', function () {
        it('returns the last record', function () {
          return assert.eventually.propertyVal(User.last, 'name', 'Ringo');
        });
      });
    });

    describe('find', function () {
      describe('using id', function () {
        it('finds the record', function () {
          return User.find(2).then(user => {
            assert.equal(user.name, 'Paul');
          });
        });
      });

      describe('using args', function () {
        it('finds the record', function () {
          return User.find({ name: 'Paul' }).then(user => {
            assert.equal(user.id, 2);
          });
        });
      });
    });
  });

  describe('#order', function () {
    it('orders by id', function () {
      return User.order('id').first.then(user => {
        assert.equal(user.attributes.name, 'John');
      });
    });

    it('orders by name', function () {
      return assert.eventually.propertyVal(User.order('name').first, 'name', 'George');
    });

    it('orders by name desc', function () {
      return assert.eventually.propertyVal(User.order('name desc').first, 'name', 'Ringo');
    });
  });
});
