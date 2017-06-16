const __cache__ = {};
const defaultConfig = {
	// 网站备注名称
	name: '',

	// 网站的URL
	url: '',

	// 显示文章列表的数量
	limit: 3,

	// 设置超时时间, 默认10s
	timeout: 10000,

	// 如果是异步，触发loadEventFired后，监听该DOM树，范围小提高性能，默认为body
	observer_selector: 'body'

	// 区域元素selector
	// sectionSelector: '.post',
	// data: {
	// 	title: {
	// 		selector: '.archive-title'
	// 	},
	// 	link: {
	// 		selector: '.archive-title',
	// 		attribute: 'href' //默认没有，则取元素的innerHTML
	// 	},
	// 	date: {
	// 		selector: '.post-meta > p',
	// 		childNodes: 3,  // 该元素的childNodes数组中index的元素 （包括注释节点，文本节点）
	// 		//children: 3,  // 该元素的children数组中index的元素 （只包括元素节点）
	// 		attribute: 'href' // node.childNodes[3].getAttribute('href')
	// 	},
	// 	// nest - TO-DO
	// 	nest: {
	// 		selector: '.post-meta',
	// 		data: {
	// 			key1: {
	// 				selector: 'p'
	// 			},
	// 			key1: {
	// 				selector: 'span'
	// 			}
	// 		}
	// 		// attribute属性失效，如果存在data对象
	// 	}
	// }
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
		
		let { url,
			name,
			limit,
			data,
			sectionSelector,
			observer_selector, 
			timeout } = config;
		let datas = [];

		if(!sectionSelector){
			reject('config.json error: "sectionSelector" require');
			return;
		}

		data = data ? data : {}

		if(__cache__[url]){
			resolve(__cache__[url]);
			return;
		}

		try{

			// create a new tab through chrome headless mode.
			let client = await creatNewTab();
			const { Page, DOM } = client;
		    await Page.enable();
		    await DOM.enable();
		    await Page.navigate({url: url});
		    await Page.loadEventFired();

		    // Wait for the specific element appears
			let waitNodeAppearsResult = await waitNodeAppears(client, sectionSelector, {observerSelector: observer_selector, timeout: timeout});
			if(waitNodeAppearsResult == 0){
				reject('sectionSelector not valid or DOM not found');
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
			let sections = [...dom.window.document.querySelectorAll(sectionSelector)].slice(0, limit);
			for(let i = 0; i < sections.length; i++){
				let section = sections[i];
				datas[i] = {};
				_.forEach(data, (v, k)=>{
					let attribute  = v['attribute'];
					let selector   = v['selector'];
					let childNodes = v['childNodes'];
					let children   = v['children'];

					let node = section.querySelector(selector);
					if(!selector || !node){
						return;
					} else if(attribute && childNodes === undefined && children === undefined){
						if(node.getAttribute){
							datas[i][k] = node.getAttribute(attribute);
						}
					} else if((childNodes && _.isNumber(childNodes)) || 
								(children && _.isNumber(children))){

						if(childNodes){
							node = node.childNodes[childNodes];
						} else {
							node = node.children[children];
						}

						if(attribute && node.getAttribute){
							datas[i][k] = node.getAttribute(attribute);
						} else if(node.innerHTML){
							datas[i][k] = node.innerHTML;
						} else if(node.nodeValue){
							datas[i][k] = node.nodeValue;
						} else {
							datas[i][k] = "";
						}
					} else {
						datas[i][k] = node.innerHTML;
					}

					if(datas[i][k]){
						datas[i][k] = datas[i][k].replace(/(^\s*)|(\s*$)/g, "");
					}
				})
			}
		    await client.close();

		} catch(error){
			console.log('getPostList: ', error);
			reject(error);
		}

		let item = {
			url: url,
			name: name,
			datas: datas
		};
		__cache__[url] = item;
		resolve(item);
	})
}

module.exports = {
	getPostList: getPostList
}