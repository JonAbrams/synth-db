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
  });
};
