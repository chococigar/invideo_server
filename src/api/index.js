const Router = require('koa-router');

const api = new Router();
const auth = require('./auth');
//const video = require('./video');


api.use('/auth', auth.routes());
//api.use('/video', video.routes());

module.exports = api;