'use strict';

// const helmet = require('koa-helmet');

// const promiseDelay = require('promise-delay');

const Koa = require('koa');
const app = module.exports = new Koa();
const cors = require('kcors');
// app.use(require('koa-response-time')());
// app.use(require('koa-favicon')(require.resolve('./public/favicon.ico')));
// app.use(require('koa-conditional-get')());
// app.use(require('koa-etag')());
// app.use(require('koa-morgan')('combined'));

// app.use(require('koa-compress')({
//     flush: require('zlib').Z_SYNC_FLUSH
// }));
app.keys = ['some secret hurr'];
app.use(cors());

// app.use(adapt(require('koa-session')({
//     maxAge: 24 * 60 * 60 * 1000 // One Day
// }, app)));

app.use(require('koa-bodyparser')({
    // BodyParser options here
}));

app.use(require('koa-static')(__dirname + '/public/vue/dist'));
// app.use(require('koa-static')(__dirname + '/public/react/dist'));

// const mount = require('koa-mount');
// app.use(mount('/public', require('koa-static')('public')));

const router = require('./routes');

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000)

console.log('Now start API server on port ' + 3000 + '...')