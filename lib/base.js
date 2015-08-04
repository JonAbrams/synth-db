'use strict'

let Relation = require('./relation');

let knex = null;

class Base extends Relation {
  constructor (attrs) {
    let self = super();
    if (!knex) throw 'You must first assign knex to use Base';
    attrs = attrs || {};

    if (!self.constructor.attributes) throw `You must first init ${this.constructor.name}`;
    self.changed = [];
    Object.keys(attrs).forEach(attr => {
      self[attr] = attrs[attr];
    });
  }

  static init () {
    if (this.attributes) return Promise.resolve(null);
    return this.resetColumnInformation();
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
    if (name in this.prototype) return;
    this.attributes[name] = type;

    Object.defineProperty(this.prototype, name, {
      get: function () {
        return this['_' + name];
      },
      set: function (newVal) {
        this.changed.push(name);
        this['_' + name] = newVal;
        return newVal;
      }
    });
  }

  static set knex (newKnex) {
    return knex = newKnex;
  }

  static get knex () {
    return knex;
  }

  save () {
    let self = this;
    let changeHash = {};
    self.changed.forEach(name => {
      changeHash[name] = self['_' + name];
    });
    self.changed = [];
    if ('_id' in self) {
      return knex(self.table).update(changeHash).where({ id: self._id }).then(
        res => self
      );
    } else {
      return knex(self.table).insert(changeHash).returning('id').then(ids => {
        self._id = ids[0];
        return self;
      });
    }
  }
}

module.exports = exports = Base;
