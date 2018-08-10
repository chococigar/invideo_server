/*'use strict';
	Router = require('koa-router'),
	serve = require('koa-static');
var views = require('koa-views');
const mount = require('koa-mount');
var render = require('koa-views-render');
var render = views("public", { map: { html: 'swig' }});
var fs = require('fs');
let logger = require('koa-logger');


const video = new Router();

const PassThrough = require('stream').PassThrough;
const request = require('request');

let app = koa();
*/

/*video.use(serve(process.cwd() + "/videos/"))

video.get('/basicsquat.mp4', (ctx, next)=>{
	ctx.body = fs.createReadStream("basicsquat.mp4");
	console.log("cur process is at "  + process.cwd() )
	ctx.set('Content-Type', 'video/mp4');
});*/


/*
video.get('/', (ctx, next)=>{
	ctx.body = "hello world!";
});

module.exports = video;

*/