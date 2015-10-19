'use strict';

let Base = require('../lib/base');
let testdb = require('./testdb');
let knex = testdb.knex;
let Post = require('./sample_data/post');
let User = require('./sample_data/user');

Base.knex = knex;

beforeEach(function () {
  return testdb.refresh().then(function () {
    return User.init();
  }).then(function () {
    return Post.init();
  });
});

describe('relationships', function () {
  describe('belongsTo', function () {
    describe('just assigned', function () {
      let userId;
      beforeEach(function () {
        return new User({
          name: "Jon"
        }).save()
        .then(user => {
          this.user = user;
          userId = user.id;

          return new Post({
            user: this.user,
            subject:'test subj',
            message: 'the best post ever!'
          }).save()
        })
        .then(post => this.post = post);
      });

      it('throws when wrong trype', function () {
        assert.throws(() => {
          this.post.user = {};
        }, /Must be an instance of/);
      });

      it('returns proper class instance', function () {
        assert.equal(this.post.user.constructor.name, 'User');
      });

      it('returns user with expected name', function () {
        assert.equal(this.post.user.name, 'Jon');
      });

      it('returns user id', function () {
        assert.equal(this.post.user_id, userId);
      });
    });
  });
});
