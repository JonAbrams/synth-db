'use strict';

let sdb = require('../../index');

let User = require('./user');

module.exports = class Post extends sdb.Base {
  static relationships (r) {
    r.belongsTo('user');
  }
}
