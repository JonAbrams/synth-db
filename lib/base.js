'use strict';

let Relation = require('./relation');
let RelationshipBuilder = require('./relationshipBuilder');

let knex = null;

let modelClasses = {};

class Base extends Relation {
  constructor (attrs = {}) {
    if (!knex) throw 'You must first assign knex to use Base';
    super(attrs);

    if (!this.constructor.attributes) throw `You must first init ${this.constructor.name}`;
    this.changed = [];
    Object.keys(attrs).forEach(attr => {
      this[attr] = attrs[attr];
    });

    /*
      Don't inherit .then from Relation.
      This allows records to be returned by promises
    */
    this.then = null;
  }

  static init () {
    let existing = modelClasses[this.name.toLowerCase()];
    if (existing && existing === this) return Promise.resolve(null);

    modelClasses[this.name.toLowerCase()] = this;
    return this.resetColumnInformation();
  }

  static resetColumnInformation () {
    let rBuilder = new RelationshipBuilder(this);

    return knex(this.table).columnInfo().then(columns => {
      Object.keys(columns).forEach(column => {
        this.addAttribute(column, columns[column].type);
      });

      /* Add relationships */
      this.relationships(rBuilder);
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
    Relation.knex = newKnex;
    return knex = newKnex;
  }

  static get knex () {
    return knex;
  }

  static relationships () {}

  static get modelClasses () {
    return modelClasses;
  }

  save () {
    let changeHash = {};
    this.changed.forEach(name => {
      changeHash[name] = this['_' + name];
    });
    this.changed = [];
    if ('_id' in this) {
      return knex(this.table).update(changeHash).where({ id: this._id }).then(
        res => {
          return this;
        }
      );
    } else {
      return knex(this.table).insert(changeHash).returning('id').then(ids => {
        this._id = ids[0];
        return this;
      });
    }
  }
}

module.exports = exports = Base;
