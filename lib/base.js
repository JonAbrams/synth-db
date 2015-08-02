'use strict'

var inflection = require( 'inflection' );

var Relation = require('./relation');

let knex = null;

class Base extends Relation {
  constructor (table_name) {
    if (!this.name) throw "You must assign a class name";
    super();
    this.changed = [];
    this.changes = {};
  }

  static get table () {
    return inflection.tableize(this.name);
  }

  static init () {
    if (Object.keys(this.attributes).length === 0) {
      return this.resetColumnInformation();
    } else {
      return Promise.resolve(null);
    }
  }

  static resetColumnInformation () {
    let self = this; // Apparently this is still needed *grumble*
    return knex(self.table).columnInfo().then(columns => {
      Object.keys(columns).forEach(column => {
        self.addAttribute(column, columns[column].type);
      });
    });
  }

  static addAttribute (name, type) {
    if (!this.attributes) {
      this.attributes = {};
    }
    this.attributes[name] = type;
    Object.defineProperty(this.prototype, name, {
      get: function () {
        return this['_' + name];
      },
      set: function (newVal) {
        this.changed.push(name);
        this.changes[name] = [this['_' + name], newVal];
        this['_' + name] = newVal;
        return newVal;
      }
    });
  }
}

module.exports = exports = Base;

exports.setKnex = function (newKnex) {
  knex = newKnex;
  return Base;
}
