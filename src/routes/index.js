const Router       = require('koa-router');
const router       = new Router();
const htmlSelector = require('html-selector');
const config       = require('../config.json');
const __cache__    = {};
const cache        = require('memory-cache');
const cacheTimeout = 360000;

// /Applications/Google\ Chrome\ dev.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu
// /Applications/Google\ Chrome\ beta.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu


// const _config = ctx.request.body
// const _config = ctx.params;

router.post('/site', async (ctx, next) => {
	let url = ctx.request.body.url;
	let site = config.find((site)=>{return site.url == url});
	let data;
	if(!site){
		ctx.body = {};
		return;
	}

	if(cache.get(url)){
		ctx.body = cache.get(url);
		return;
	}

	try {
		data = await htmlSelector(site);
		cache.put(url, data, cacheTimeout);
	} catch(error){
		console.log('error: ', error.toString());
		ctx.body = { error: error.toString()};
		return;
	}

	ctx.body = data;
})

router.get('/config', async (ctx, next) => {
	console.log('/config');
	ctx.body = config;
})

module.exports = router