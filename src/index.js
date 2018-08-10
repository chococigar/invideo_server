require('dotenv').config(); // .env 파일에서 환경변수 불러오기

const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const serve = require('koa-static'); 

const { jwtMiddleware } = require('./lib/token');
const api = require('./api');

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI).then(
    (response) => {
        console.log('Successfully connected to mongodb');
    }
).catch(e => {
    console.error(e);
});


app.use(logger());
app.use(serve("./videos"));
app.use(bodyParser()); //should be above router
app.use(jwtMiddleware);
app.use(cors());



router.use('/api', api.routes()); // sets api route under the /api directory
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
    console.log('Invideo server is listening to port ' + port);
});


