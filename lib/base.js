'use strict';

let Relation = require('./relation');
let RelationshipBuilder = require('./relationshipBuilder');

let knex = null;

let modelClasses = {};

class Base extends Relation {
  constructor (attrs = {}) {
    if (!knex) throw 'You must first assign knex to use Base';
    super();

    if (!this.constructor.attributes) throw `You must first init ${this.constructor.name}`;
    this.changed = [];
    this.attributes = {};
    this.relations = {};
    this.promises = [];
    // Initialize all attributes to null
    Object.keys(this.constructor.attributes).forEach(attr => {
      this.attributes[attr] = null;
    });
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
        return this.attributes[name];
      },
      set: function (newVal) {
        this.changed.push(name);
        this.attributes[name] = newVal;
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

  static get all () {
    return new Relation(null, this);
  }

  static get modelName () {
    return this.name.toLowerCase();
  }

  static get foreignKey () {
    return this.modelName + '_id';
  }

  get modelName () {
    return this.constructor.modelName;
  }

  get foreignKey () {
    return this.constructor.foreignKey;
  }

  save () {
    let changeHash = {};
    if (this.changed.length === 0) {
      return Promise.resolve(this);
    }
    this.changed.forEach(name => {
      changeHash[name] = this.attributes[name];
    });
    this.changed = [];

    if (this.attributes.id !== null) {
      this.promises.push(knex(this.table).update(changeHash).where({ id: this.id }));
    } else {
      this.promises.push(knex(this.table).insert(changeHash).returning('id').then(ids => {
        this.attributes.id = ids[0];
      }));
    }

    return Promise.all(this.promises).then(() => {
      this.promises = [];
      return this;
    });
  }
}

module.exports = exports = Base;
