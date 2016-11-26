'use strict';

var {Base} = require('../../index');

module.exports = class User extends Base {
  static relationships (r) {
    r.hasMany('posts');
  }
};
