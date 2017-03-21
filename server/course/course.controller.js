'use strict';

const { createError } = require('../shared/error/helpers');
const { Course, User } = require('../shared/database');
const { NOT_FOUND } = require('http-status-codes');
const map = require('lodash/map');
const listOptions = require('../shared/util/listOptions');
const pick = require('lodash/pick');

function index({ query, user }, res) {
  const opts = listOptions(query);
  const promise = user.isAdmin() ? Course.findAll(opts) : user.getCourses(opts);
  return promise.then(courses => res.json({ data: courses }));
};

function create({ body, user }, res) {
  return Course
    .create(body, {
      isNewRecord: true,
      returning: true,
      context: { userId: user.id }
    })
    .then(course => res.json({ data: course }));
}

function get(req, res) {
  res.json({ data: req.course });
}

function patch({ body, course, user }, res) {
  const data = pick(body, ['name', 'description']);
  return course.update(data, { context: { userId: user.id } })
    .then(course => res.json({ data: course }));
};

function remove({ course, user }, res) {
  return course.destroy({ context: { userId: user.id } })
    .then(() => res.status(204).send());
};

function getUsers(req, res) {
  return req.course.getUsers()
    .then(users => res.json({ data: map(users, transform) }));
}

function upsertUser(req, res) {
  const { course } = req;
  const { email, role } = req.body;
  return User.findOne({ where: { email } })
    .then(user => user || User.invite({ email }))
    // TODO: Find out why through: { role } isn't working
    .then(user => course.addUser(user).then(() => user))
    .then(user => course.getUser(user))
    .then(user => {
      user.courseUser.role = role;
      return user.courseUser.save().then(() => transform(user));
    })
    .then(user => res.json({ data: { user } }));
}

function removeUser(req, res) {
  const { course } = req;
  const { userId } = req.params;
  return User.findById(userId)
    .then(user => user || createError(NOT_FOUND, 'User not found'))
    .then(user => course.removeUser(user))
    .then(() => res.end());
}

const transform = user => {
  return Object.assign(user.profile, { courseRole: user.courseUser.role });
};

module.exports = {
  index,
  create,
  get,
  patch,
  remove,
  getUsers,
  upsertUser,
  removeUser
};
