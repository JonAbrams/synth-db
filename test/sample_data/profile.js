'use strict';

let sdb = require('../../index');

module.exports = class Profile extends sdb.Base {
  static relationships (r) {
    r.belongsTo('user');
  }
}
