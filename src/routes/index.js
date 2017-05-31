const Router = require('koa-router');
const CDP    = require('chrome-remote-interface');
const _      = require('lodash');
const jsdom  = require("jsdom");
const { JSDOM } = jsdom;

const router = new Router();

var __post__cache__ = {};

const defaultConfig = {
	// 网站的URL
	url: '',

	// 显示文章列表的数量
	limit: 3,

	// 设置超时时间, 默认10s
	timeout: 10000,

	// 如果是异步，触发loadEventFired后，监听该DOM树，范围小提高性能，默认为body
	observer_selector: 'body',

	// 文章列表标题、描述的selector
	title_selector: 'null',
	desc_selector: 'null',

	// 会取该元素的href
	link_selector: 'null' 
}

// const _config = ctx.request.body
// const _config = ctx.params;


// get posts info through the config 
router.post('/posts', async (ctx, next) => {
	let config = ctx.request.body

	let posts;
	try {
		posts = await getPostList(siteConfig)
	} catch(error){
		ctx.body = { error: error };
		return;
	}

	ctx.body = {
		posts: posts
	}
})


function getPostList(config) {
	return new Promise(async (resolve, reject)=>{
		config = _.extend(defaultConfig, config);
		
		// if(__post__cache__[config.url]){
		// 	resolve(__post__cache__[config.url]);
		// 	return;
		// }

		let { url,
			limit,
			title_selector, 
			desc_selector,
			link_selector,
			observer_selector, 
			timeout } = config;

		// create a new tab through chrome headless mode.
		let client = await creatNewTab();
		const { Page, DOM } = client;
	    await Page.enable();
	    await DOM.enable();
	    await Page.navigate({url: url});
	    await Page.loadEventFired();

	    // Wait for the specific element appears
		let waitNodeAppearsResult = await waitNodeAppears(client, title_selector, {observerSelector: observer_selector, timeout: timeout});
		if(waitNodeAppearsResult == 0){
			reject('title_selector not valid or DOM not found');
			return;
		}

		// get the html for analysis
		let html = await getPageHtml(client, observer_selector);
		if(!html){
			reject('get page html error');
			return;
		}
		// get the informations from dom
		const dom = new JSDOM(html);
		let _document = dom.window.document;
		let titlesDOM = [..._document.querySelectorAll(title_selector)].slice(0, limit);
		let descsDOM  = [..._document.querySelectorAll(desc_selector)].slice(0, limit);
		let linksDOM  = [..._document.querySelectorAll(link_selector)].slice(0, limit);

		let posts = [];
		for(let i = 0; i < titlesDOM.length; i++){
			let title = titlesDOM[i] ? titlesDOM[i].innerHTML : '';
			let desc  = descsDOM[i] ? descsDOM[i].innerHTML : '';
			let link  = linksDOM[i] ? linksDOM[i].href : '';
			link = titlesDOM[i] ? titlesDOM[i].href : '';

			if(link && (link.indexOf('http://') < 0 || link.indexOf('http://') < 0 )){
				link = url + link;
			}

			posts[i] = {
				title : title,
				desc  : desc.replace(/(^\s*)|(\s*$)/g, ""),
				link  : link || ''
			}
		}

	    await client.close();
		resolve({
			url: url,
			posts: posts
		});
	})
}

// getPostList({
// 	url: 'http://web.jobbole.com/all-posts/',
// 	title_selector: '.archive-title',
// 	desc_selector: '.post-meta .excerpt p',
// 	link_selector: '.archive-title',
// }).then((res)=>{
// 	console.log('posts', res.posts);
// }).catch((error)=>{
// 	console.log(error);
// })


// getPostList({
// 	url: 'http://taobaofed.org/',
// 	title_selector: '.article-title a',
// 	desc_selector: '.article-excerpt',
// 	link_selector: '.article-title a',

// }).then((res)=>{
// 	console.log('posts', res.posts);
// }).catch((error)=>{
// 	console.log(error);
// })


function testWaitNodeAppears(url){
	CDP.New().then((target) => {
	    return CDP({target});
	}).then(async (client) => {
		console.log('chrome conneted');
		const { Page, DOM } = client;
	    await Page.enable();
	    await DOM.enable();
	    await Page.navigate({url: url});
	    await Page.loadEventFired()

		let waitNodeAppearsResult = await waitNodeAppears(client, ".shader_left", {timeout: 2000})
		if(waitNodeAppearsResult == 0){
			console.log('node not appears')
		} else {
			console.log('node appeared')
		}
	    await client.close();

	}).catch(async (err) => {
	    console.error(err);
	});
}

// testNodeAppears('http://www.bing.com')
// getPageHtml('http://www.baidu.com');
// getPageHtml('http://www.taobao.com');
// closeAllTab()

// /Applications/Google\ Chrome\ dev.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu
// /Applications/Google\ Chrome\ beta.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 https://baidu.com --disable-gpu


function creatNewTab(){
	return new Promise((resolve, reject)=>{
		CDP.New().then((target) => {
		    return CDP({target});
		}).then((client) => {
			console.log('new tab created');
			resolve(client);
		}).catch(async (err) => {
			console.log('create new tab error');
			reject(err);
		});	
	})
}

// 获取页面的html代码
async function getPageHtml(client, selector = 'body'){
	const { DOM } = client;
	try {
        let dom  = await DOM.getDocument();
		let nodeId = await DOM.querySelector({nodeId: 1,selector: selector});
        let html = await DOM.getOuterHTML(nodeId);
        return html.outerHTML;
	} catch (err) {
	    console.error(err);
		return false;
	}
}

// 等待某一个DOM元素出现, 返回0代表超时未出现， 1代表出现
async function waitNodeAppears(client, selector, {observerSelector = 'body', timeout = 10000} = {}) {
	if(!_.isNumber(timeout)){
		throw new Error('timeout not valid, require number') 
	}

    // browser code to register and parse mutations
    const browserCode = (selector, observerSelector, timeout) => {
        return new Promise((resolve, reject) => {
        	if(document.querySelector(selector)){
        		resolve(1);
        		return;
        	}

        	// https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
            let observer = new MutationObserver((mutations, observer) => {
                const nodes = [];
                mutations.forEach((mutation) => {
                    nodes.push(...mutation.addedNodes);
                });

                if (nodes.find((node) => node.matches(selector))) {
                    observer.disconnect();
                    resolve(1);
                }

                for(let i = 0; i < nodes.length; i++){
                	if(nodes[i] && nodes[i].querySelector && nodes[i].querySelector(selector)){
                		observer.disconnect();
                    	resolve(1);
                    	break;
                	}
                }
            })

            observer.observe(document.querySelector(observerSelector), {
                childList: true
            });

	        setTimeout(function() {
	        	observer.disconnect();
	        	// wait node appears timeout
	            resolve(0);
	        }, timeout);
        });
    };

    // inject the browser code
    const {Runtime} = client;
    let RuntimeResult = await Runtime.evaluate({
        expression: `(${browserCode})(${JSON.stringify(selector)}, ${JSON.stringify(observerSelector)}, ${JSON.stringify(timeout)})`,
        awaitPromise: true
    });

    let val = RuntimeResult.result.value;
    if (val == 0) {
    	// wait node appears timeout, not found
    	return val; 
    } else if(val == 1){
    	// found
		return val; 
    }
}

function closeAllTab(){
	CDP.List( (err, targets) => {
	    if (err) {
	        console.log(err);
	        return;
	    }
	    targets.forEach((target)=>{
	    	CDP.Close(target, function (err) {
			    if (err) {
			        console.log(err);
			        return;
			    }
			});
	    })
	});
}

function awaitTimeout(ms = 0, error) {
    return new Promise((resolve, reject) => {
        let fn = error ? reject : resolve;
        setTimeout(() => {
            fn(error)
        }, ms);
    })
}



module.exports = router