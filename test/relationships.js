'use strict';

let Base = require('../lib/base');
let testdb = require('./testdb');
let knex = testdb.knex;
let Post = require('./sample_data/post');
let User = require('./sample_data/user');

Base.knex = knex;

describe('relationships', function () {
  let userId;
  beforeEach(function () {
    return testdb.refresh().then(function () {
      return User.init();
    }).then(function () {
      return Post.init();
    }).then(function () {
      return new User({
        name: "Jon"
      }).save();
    }).then(user => {
      this.user = user;
      userId = user.id;

      return new Post({
        user: user,
        subject:'test subj',
        message: 'the best post ever!'
      }).save();
    }).then(post => this.post = post);
  });

  describe('belongsTo', function () {
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

  describe('hasMany', function () {
    it('assigns records', function () {
      let newPost = new Post();
      this.user.posts = [newPost];
      assert.deepEqual(this.user.posts, [newPost]);
    });

    it.skip('returns records', function () {
      assert.deepEqual(this.user.posts, [this.post]);
    });
  });
});
