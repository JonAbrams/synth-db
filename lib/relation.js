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

  first () {
    let query = this.__knexQuery;
    if (!this.__orderings) {
      query = query.orderBy('id', 'asc');
    }
    return query.limit(1).then(results => results[0]);
  }

  last () {
    let query = this.__knexQuery;
    if (!this.__orderings) {
      query = query.orderBy('id', 'desc');
    }
    return query.limit(1).then(results => results[0]);
  }

  all (resolved, rejected) {
    return this.then(resolved, rejected);
  }

}

module.exports = Relation;
