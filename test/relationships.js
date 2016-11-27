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
        subject:'test subj',
        message: 'the best post ever!'
      }).save();
    }).then(post => this.post = post);
  });

  describe('belongsTo', function () {
    describe('assignment', function () {
      beforeEach(function () {
        return this.post.user = this.user;
      });

      it('throws when wrong trype', function () {
        assert.throws(() => {
          this.post.user = {};
        }, /Must be an instance of/);
      });

      it('returns proper class instance', function () {
        return this.post.user.then(user =>
          assert.equal(user.constructor.name, 'User')
        );
      });

      it('returns user with expected name', function () {
        return this.post.user.then(user =>
          assert.equal(user.name, 'Jon')
        );
      });

      it('returns user id', function () {
        assert.equal(this.post.user_id, userId);
      });
    });

    it('returns record', function () {
      this.post.user = this.user;

      return this.post.save().then(function () {
        return Post.first;
      }).then(post => {
        return post.user;
      }).then(user => {
        assert.deepEqual(user.attributes, this.user.attributes);
        assert.equal(user.constructor, User);
      });
    });
  });

  describe('hasMany', function () {
    describe('assigns records', function () {
      beforeEach(function () {
        this.newPost = new Post();
        return this.user.posts = [this.newPost];
      });

      it('is available', function () {
        return this.user.posts.then(posts =>
          assert.deepEqual(posts, [this.newPost])
        );
      })
    });

    it.skip('returns records', function () {
      this.post.user = this.user;

      return this.post.save().then(function () {
        return this.user.posts;
      }).then(posts =>
        assert.deepEqual(posts, [this.post])
      );
    });
  });
});
