let unBlock = false;
let curTabId = 0;
var blockCount = 0;
var allBlockCount = 0;
let urlOptions = [{url: 'https://exampleSite.com', unBlock: true, childsLimit: 4}];
let childsLimit = 9;
let blockString = '[contains(., "СловоБлокировки1") and count(child::node())<childsLimit]';
let blockOnlyUrlOpt = false;

chrome.runtime.onMessage.addListener( (result, sender) => {
	if (sender.tab.id === curTabId) {
		blockCount = (result.action === 'blockcontent' && result.lazyLoad ? blockCount + result.blockCount : result.blockCount);
		chrome.browserAction.setBadgeText({text: '' + blockCount});
	}
	if (result.action === 'blockcontent') {
		allBlockCount += result.blockCount;
		chrome.storage.local.set({allBlockCount: allBlockCount});
	}
});

chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tabInfo) => {
	let blockStr = '';
	if (changeInfo.status !== 'complete') return;
	if (curTabId === tabId) {
		blockCount = 0;
		chrome.browserAction.setBadgeText({text: ''});
	}
	let index = urlOptions.findIndex(opt => tabInfo.url.startsWith(opt.url));
	if (index !== -1)
		blockStr = urlOptions[index].unBlock ? '' : blockString.replace(/childsLimit/gm, urlOptions[index].childsLimit);
	else
		blockStr = blockOnlyUrlOpt ? '' : blockString.replace(/childsLimit/gm, childsLimit);
	chrome.tabs.sendMessage(tabId, {action: 'blockcontent', blockString: (unBlock ? '' : blockStr)});	
	if (unBlock) unBlock = false;
});

chrome.tabs.onActivated.addListener( (activeInfo) => {
	curTabId = activeInfo.tabId;
	chrome.browserAction.setBadgeText({text: ''});
	blockCount = 0;
	chrome.tabs.sendMessage(activeInfo.tabId, {action: 'getblockCount'});
});

function reloadTab(){
	unBlock = true;
	chrome.tabs.reload(curTabId, {bypassCache: true});
}

chrome.storage.local.get('allBlockCount', (result) => {
	allBlockCount = (result.allBlockCount ? result.allBlockCount : 0);
});

chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
	if (tabs.length) curTabId = tabs[0].id;
});