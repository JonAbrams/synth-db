'use strict';

let inflection = require( 'inflection' );

let Base = require('./base');

class Relation {
  constructor (query) {
    if (!this.constructor.name) throw "You must assign a class name";
    this.knex = Base.knex;
    this.__knexQuery = query || this.constructor.knex.table(this.table);
  }

  static get table () {
    return inflection.tableize(this.name);
  }

  get table () {
    return this.constructor.table;
  }

  get first () {
    let query = this.__knexQuery;
    if (!this.__orderings) {
      query = query.orderBy('id', 'asc');
    }
    return query.limit(1).then(results => results[0] || null);
  }

  static get first () {
    return new this().first;
  }

  static get last () {
    return new this().last;
  }

  get last () {
    let query = this.__knexQuery;
    if (!this.__orderings) {
      query = query.orderBy('id', 'desc');
    }
    return query.limit(1).then(results => results[0]);
  }

  get all () {
    return this.then();
  }

  then (resolved, rejected) {
    return this.__knexQuery.then(resolved, rejected);
  }

  toSql () {
    return this.__knexQuery.toSQL().sql;
  }

  where (arg) {
    if (typeof arg === 'string') {
      return new Relation(
        this.__knexQuery.whereRaw.apply(this.__knexQuery, arguments)
      );
    } else if (typeof arg === 'object') {
      return this.__knexQuery.where(arg);
    }
  }

  limit (limit) {
    if (!(limit > 0)) throw "The value given to limit must be greater than 0";
    return new Relation(
      this.__knexQuery.limit(limit)
    );
  }
}

module.exports = Relation;
