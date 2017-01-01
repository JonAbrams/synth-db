'use strict';

let sdb = require('../../index');

module.exports = class Post extends sdb.Base {
  static relationships (r) {
    r.belongsTo('user');
  }
}
