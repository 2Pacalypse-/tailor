'use strict';

const assign = require('lodash/assign');
const defaultsDeep = require('lodash/defaultsDeep');
const pick = require('lodash/pick');

const filter = {
  where: {},
  offset: 0,
  limit: null,
  order: [['id', 'ASC']],
  paranoid: true
};

module.exports = function (defaults) {
  return function (req, res, next) {
    const order = [[req.query.sortBy, req.query.sortOrder]];
    const query = assign(pick(req.query, ['offset', 'limit', 'paranoid']), { order });
    const options = defaultsDeep({}, query, defaults, filter);

    if (query.integration) { options.paranoid = false; }

    if (query.syncedAt) {
      const condition = { $gte: query.syncedAt };
      options.where.$or = [{ updatedAt: condition }, { deletedAt: condition }];
    }

    req.opts = options;

    next();
  };
};
