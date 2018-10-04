let timeout = null;
let blockCount = 0;
let blockString = '';

chrome.runtime.onMessage.addListener( (mes) => {
	if(mes.action === 'blockcontent') {
		blockString = mes.blockString;
		blockcontent(false);
	} else if (mes.action === 'getblockCount' && blockString !== '') {
		chrome.runtime.sendMessage({blockCount: blockCount, action: 'getblockCount'});
	}	
});

function blockcontent(lazyLoad){
	let count = 0;
	if (blockString === '') return;
	let search = document.evaluate('/html/body//*' + blockString, document.body, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	let thisHeading = search.iterateNext(); 
	while (thisHeading) {
		if (thisHeading.tagName !== 'script' && thisHeading.style.display != 'none') {
			thisHeading.style.display = 'none';
			count += 1;
		}
		thisHeading = search.iterateNext();
	}
	blockCount += count;
	chrome.runtime.sendMessage({blockCount: (lazyLoad ? count : blockCount), action: 'blockcontent', lazyLoad: lazyLoad});
}

const mutationCallback = (mutationsList, observer) => { blockcontent(true); };
const observer = new MutationObserver(mutationCallback);
observer.observe(document.documentElement, { attributes: false, childList: true, subtree: true });