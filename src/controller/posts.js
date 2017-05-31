const __post__cache__ = {};
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


const _      = require('lodash');
const jsdom  = require("jsdom");
const { JSDOM } = jsdom;

const chrome = require('../libs/chrome.js');
const creatNewTab     = chrome.creatNewTab;
const getPageHtml     = chrome.getPageHtml;
const waitNodeAppears = chrome.waitNodeAppears;
const closeAllTab     = chrome.closeAllTab;


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

module.exports = {
	getPostList: getPostList
}