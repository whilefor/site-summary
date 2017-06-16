const Router = require('koa-router');
const router = new Router();
const getPostList = require('../controller/site.js').getPostList;
const config = require('../config.json');
// /Applications/Google\ Chrome\ dev.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu
// /Applications/Google\ Chrome\ beta.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu


// const _config = ctx.request.body
// const _config = ctx.params;


// get posts info through the config 
router.post('/posts', async (ctx, next) => {
	let url = ctx.request.body.url;
	let site = config.find((site)=>{return site.url == url});
	if(!site){
		ctx.body = {
			posts: []
		}
		return;
	}

	try {
		posts = await getPostList(site);
	} catch(error){
		ctx.body = { error: error };
		return;
	}

	ctx.body = posts;
})

router.get('/config', async (ctx, next) => {
	ctx.body = config
})

module.exports = router