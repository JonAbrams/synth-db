var assert = require('assert');
var root = require('../index');

describe('init', function () {
  it('opens connection', function () {
    var sdb = sdb.init('postgres://localhost');
    assert.notEqual(sdb.knex, null);
  });
});
