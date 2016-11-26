'use strict';

let inflection = require('inflection');

class Relation {
  constructor (query) {
    if (!this.constructor.name) throw "You must assign a class name";
    this.__knexQuery = query || this.constructor.knex.table(this.table);
  }

  static get table () {
    return inflection.tableize(this.name);
  }

  get table () {
    return this.constructor.table;
  }

  get first () {
    let query = applyDefaultOrder(this.__knexQuery, 'asc');
    return query.limit(1).then(results => {
      // Results is an array of 0 or 1 plain object
      if (!results[0]) return null;
      // Return a proper sdb.Base instance, not a plain object
      let model = new this.constructor(results[0]);
      model.changed = [];
      return model;
    });
  }

  static get first () {
    return new this().first;
  }

  get last () {
    let query = applyDefaultOrder(this.__knexQuery, 'desc');
    return query.limit(1).then(results => results[0] || null);
  }

  static get last () {
    return new this().last;
  }

  get all () {
    return this.then();
  }

  then (resolved, rejected) {
    // TODO: Wrap each result in a model instance
    return this.__knexQuery.then(resolved, rejected);
  }

  toSql () {
    return this.__knexQuery.toSQL().sql;
  }

  where (arg) {
    if (typeof arg === 'string') {
      return new this.constructor(
        this.__knexQuery.whereRaw.apply(this.__knexQuery, arguments)
      );
    } else if (typeof arg === 'object') {
      return new this.constructor(this.__knexQuery.where(arg));
    }
  }

  static where (arg) {
    return new this().where(arg);
  }

  limit (limit) {
    if (!(limit > 0)) throw "The value given to limit must be greater than 0";
    return new this.constructor(this.__knexQuery.limit(limit));
  }

  order (arg) {
    return new this.constructor(this.__knexQuery.orderByRaw(arg));
  }

  static order (arg) {
    return new this().order(arg);
  }
}

module.exports = Relation;

function applyDefaultOrder (query, direction) {
  let hasOrder = query._statements.some(function (s) {
    return s.grouping === 'order'
  });
  return (hasOrder) ? query : query.orderBy('id', direction);
}
