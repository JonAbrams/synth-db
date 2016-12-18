'use strict';

let Base = require('./base');
let inflection = require('inflection');

module.exports = class RelationshipBuilder {
    constructor (model) {
      this.model = model;
    }

    belongsTo (modelName) {
      let foreign_key = modelName + '_id';
      let modelClass = () => this.model.modelClasses[modelName]; // Models may not be loaded at init
      this.model.addAttribute(foreign_key, 'integer');

      Object.defineProperty(this.model.prototype, modelName, {
        get: function () {
          let record = this.relations[modelName];
          let foreign_id = this.attributes[foreign_key];

          if (record) return Promise.resolve(record);
          if (!foreign_id) return Promise.resolve(null);

          return modelClass().where({ id: foreign_id }).first;
        },
        set: function (newVal) {
          if (newVal.constructor !== modelClass()) {
            throw new Error(`Must be an instance of ${modelClass().name}`);
          }
          this.relations[modelName] = newVal;
          this.attributes[foreign_key] = newVal.id;
          this.changed.push(foreign_key);
          return newVal;
        }
      });
    }

    hasMany (modelNamePlural) {
      let modelName = inflection.singularize(modelNamePlural);
      let modelClass = () => this.model.modelClasses[modelName]; // Models may not be loaded at init

      Object.defineProperty(this.model.prototype, modelNamePlural, {
        get: function () {
          let records = this.relations[modelNamePlural];
          if (records) return Promise.resolve(records);
          if (this.id === null) return Promise.resolve(null);

          return modelClass().where({
            [this.constructor.foreign_key]: this.id
          }).then(models => {
            this.relations[modelNamePlural] = models;
            return models;
          });
        },
        set: function (newVals) {
          const valid = Array.isArray(newVals) && newVals.every(val => (
            val.constructor === modelClass()
          ));
          if (!valid) {
            throw new Error(`All values be an instance of ${modelClass().name}`);
          }
          this.relations[modelNamePlural] = newVals;
          return Promise.resolve(newVals);

          // TODO: Store records in db
        }
      });
    }
};
