exports.Base = require('./lib/base');

exports.setKnex = function (newKnex) {
  return Base.setKnex(newKnex);
}
