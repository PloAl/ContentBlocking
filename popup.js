window.onload = function(){
	let page = chrome.extension.getBackgroundPage();
	document.getElementById('blockCount').textContent = page.blockCount;
    document.getElementById('allBlockCount').textContent = page.allBlockCount;
	if (page.blockCount) {
		document.getElementById('unBlockButton').onclick = function(){
			page.reloadTab();
			window.close();
		}
	} else 
		document.getElementById('unBlockButton').disabled = true;
}