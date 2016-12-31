'use strict';

let inflection = require('inflection');

class Relation {
  constructor (query, Model) {
    this.Model = Model ? Model : this.constructor;
    if (!this.Model.name) throw "You must assign a class name";
    this.__knexQuery = query || this.constructor.knex.table(this.table);
  }

  static get table () {
    return inflection.tableize(this.name);
  }

  get table () {
    return this.Model.table;
  }

  get first () {
    let query = applyDefaultOrder(this.__knexQuery, 'asc');
    return new Relation(query, this.Model).limit(1).then(results => {
      return (results ? results[0] : null);
    });
  }

  static get first () {
    return new this().first;
  }

  get last () {
    let query = applyDefaultOrder(this.__knexQuery, 'desc');
    return new Relation(query, this.Model).limit(1).then(results => {
      return (results ? results[0] : null);
    });
  }

  static get last () {
    return new this().last;
  }

  get all () {
    return this.then();
  }

  then (resolve, reject) {
    return this.__knexQuery.then(results => {
      // No results returns null
      if (results.length === 0) return null;

      // Turn each record into a model instance
      return results.map(record => {
        let model = new this.Model(record);
        model.changed = [];
        return model;
      });
    }).then(resolve, reject);
  }

  toSql () {
    return this.__knexQuery.toSQL().sql;
  }

  where (arg) {
    if (typeof arg === 'string') {
      return new Relation(
        this.__knexQuery.whereRaw.apply(this.__knexQuery, arguments),
        this.Model
      );
    } else if (typeof arg === 'object') {
      return new Relation(this.__knexQuery.where(arg), this.Model);
    }
  }

  static where (arg) {
    return new this().where(arg);
  }

  limit (limit) {
    if (!(limit > 0)) throw "The value given to limit must be greater than 0";
    return new Relation(this.__knexQuery.limit(limit), this.Model);
  }

  order (arg) {
    return new Relation(this.__knexQuery.orderByRaw(arg), this.Model);
  }

  static order (arg) {
    return new this().order(arg);
  }

  find (id) {
    if (typeof id === 'object') {
      return this.where(id).first;
    }
    return this.where({ id }).first;
  }

  static find (id) {
    return new this().find(id);
  }
}

module.exports = Relation;

function applyDefaultOrder (query, direction) {
  let hasOrder = query._statements.some(function (s) {
    return s.grouping === 'order'
  });
  return hasOrder ? query : query.orderBy('id', direction);
}
