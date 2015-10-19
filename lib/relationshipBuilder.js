'use strict';

let Base = require('./base');

module.exports = class RelationshipBuilder {
    constructor (model) {
      this.model = model;
    }

    belongsTo (modelName) {
      this.model.addAttribute(modelName + '_id', 'integer');

      let modelClass = this.model.modelClasses[modelName];

      Object.defineProperty(this.model.prototype, modelName, {
        get: function () {
          return this['_' + modelName];
        },
        set: function (newVal) {
          if (newVal.constructor !== modelClass) {
            throw new Error(`Must be an instance of ${newVal.constructor.name}`);
          }
          this['_' + modelName] = newVal;
          this[modelName + '_id'] = newVal.id;
          return newVal;
        }
      });
    }
};
