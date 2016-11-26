'use strict';

let Base = require('./base');
let inflection = require('inflection');

module.exports = class RelationshipBuilder {
    constructor (model) {
      this.model = model;
    }

    belongsTo (modelName) {
      let modelClass = () => this.model.modelClasses[modelName]; // Models may not be loaded at init

      this.model.addAttribute(modelName + '_id', 'integer');

      Object.defineProperty(this.model.prototype, modelName, {
        get: function () {
          let record = this['_' + modelName];
          let foreign_id = this[modelName + '_id'];

          if (record) return Promise.resolve(record);
          if (!foreign_id) return Promise.resolve(null);
debugger;
          return modelClass().where({ id: foreign_id }).first;
        },
        set: function (newVal) {
          if (newVal.constructor !== modelClass()) {
            throw new Error(`Must be an instance of ${modelClass().name}`);
          }
          this['_' + modelName] = newVal;
          this[modelName + '_id'] = newVal.id;
          return newVal;
        }
      });
    }

    hasMany (modelNamePlural) {
      let modelClass = () => this.model.modelClasses[modelName]; // Models may not be loaded at init

      let modelName = inflection.singularize(modelNamePlural);

      Object.defineProperty(this.model.prototype, modelNamePlural, {
        get: function () {
          let records = this['_' + modelNamePlural];
          if (records) return Promise.resolve(records);
          return Promise.resolve(null); // TODO: Query for records
        },
        set: function (newVals) {
          const valid = Array.isArray(newVals) && newVals.every(val => (
            val.constructor === modelClass()
          ));
          if (!valid) {
            throw new Error(`All values be an instance of ${modelClass().name}`);
          }
          this['_' + modelNamePlural] = newVals;
          return Promise.resolve(newVals);

          // TODO: Store records
        }
      });
    }
};
