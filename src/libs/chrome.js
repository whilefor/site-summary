const _      = require('lodash');
const CDP    = require('chrome-remote-interface');

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

module.exports = {
    creatNewTab: creatNewTab,
    getPageHtml: getPageHtml,
    waitNodeAppears: waitNodeAppears,
    closeAllTab: closeAllTab
}
