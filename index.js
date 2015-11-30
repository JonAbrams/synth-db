exports.Base = require('./lib/base');

exports.setKnex = function (newKnex) {
  return exports.Base.knex = newKnex;
}
