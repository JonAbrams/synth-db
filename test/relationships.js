'use strict';

let Base = require('../lib/base');
let testdb = require('./testdb');
let knex = testdb.knex;
let Post = require('./sample_data/post');
let User = require('./sample_data/user');
let Profile = require('./sample_data/profile');

Base.knex = knex;

describe('relationships', function () {
  let userId;
  beforeEach(function () {
    return testdb.refresh().then(function () {
      return User.init();
    }).then(function () {
      return Post.init();
    }).then(function () {
      return Profile.init();
    }).then(function () {
      return new Profile({
        age: 18
      }).save();
    }).then(profile => {
      this.profile = profile;
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

      it('saves foreign_id as attribute', function () {
        return this.post.save().then(post => {
          assert.notEqual(post.attributes['user_id'], null);
        });
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

  describe('hasOne', function () {
    describe('assigns record', function () {
      beforeEach(function () {
        this.user.profile = this.profile;
        return this.user.save();
      });

      it('is immediately available (cached)', function () {
        assert.equal(this.user.relations.profile, this.profile);
      });

      it('stores child records', function () {
        Profile.find({ age: 18 }).then(profile => {
          assert.equal(profile.user_id, this.user.id);
        });
      });
    });

    it('returns records', function () {
      this.user.profile = this.profile;

      return this.user.save().then(() => {
        return this.user.profile;
      }).then(profile =>
        assert.deepEqual(profile.attributes, this.profile.attributes)
      );
    });
  });

  describe('hasMany', function () {
    describe('assigns records', function () {
      beforeEach(function () {
        this.newPost = new Post();
        return this.user.posts = [this.newPost];
      });

      it('is immediately available (cached)', function () {
        assert.deepEqual(this.user.relations.posts, [this.newPost]);
      });

      it('stores child records', function () {
        assert.equal(this.newPost.attributes.user_id, this.user.id);
      });
    });

    it('returns records', function () {
      this.post.user = this.user;

      return this.post.save().then(() => {
        return this.user.posts;
      }).then(posts =>
        assert.deepEqual(posts[0].attributes, this.post.attributes)
      );
    });
  });
});
