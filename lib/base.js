var inflection = require( 'inflection' );
var knex = require('knex');

class Base extends Relation {
  constructor (table_name) {
    super();
    this.table = inflection.tableize(this.constructor.name);
    return this.resetColumnInformation(() => {
      return this;
    });
  }

  resetColumnInformation () {
    return knex.table(this.table).columnInfo().then(columns => {
      Object.keys(columns).forEach(column => {
        this.addField(column, columns[column].data_type);
      });
    });
  }

  addField (name, type) {
    Object.defineProperty(this, name, {
      get: function () {

      },
      set: function (newVal) {

      }
    });
  }
}
