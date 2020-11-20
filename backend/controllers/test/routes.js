const Router = require('koa-router');
const actions = require('./actions');

module.exports = new Router({ prefix: '/test' })
  .get('/', actions.getTest);
