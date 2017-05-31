const Router = require('koa-router');
const router = new Router();
const getPostList = require('../controller/posts.js').getPostList;

// /Applications/Google\ Chrome\ dev.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu
// /Applications/Google\ Chrome\ beta.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu


// const _config = ctx.request.body
// const _config = ctx.params;


// get posts info through the config 
router.post('/posts', async (ctx, next) => {
	let config = ctx.request.body;
	console.log(config);

	let posts;
	try {
		posts = await getPostList(config)
	} catch(error){
		ctx.body = { error: error };
		return;
	}

	ctx.body = {
		posts: posts
	}
})

module.exports = router