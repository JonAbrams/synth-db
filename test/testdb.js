var knex = exports.knex = require('knex')({
  client: 'pg',
  connection: 'postgres://localhost/synth-db-test'
});

exports.refresh = function () {
  return knex.schema.dropTableIfExists('users').then(function () {
    return knex.schema.createTable('users', function (table) {
      table.increments();
      table.string('name');
      table.timestamps();
    });
  }).then(function () {
    return knex.schema.dropTableIfExists('posts');
  }).then(function () {
    return knex.schema.createTable('posts', function (table) {
      table.increments();
      table.string('subject');
      table.string('body');
      table.integer('user_id');
      table.timestamps();
    });
  })
};
