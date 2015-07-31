
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("submit").addEventListener('click', clickHandler);
}); //instead of onclick="clickHandler()" in popup.html

document.addEventListener('DOMContentLoaded', function(){
	document.getElementById("change").addEventListener('click', otherHandler);
}); //instead of onclick="otherHandler()" in popup.html

function otherHandler(){
	var myInput = document.getElementById("other").value;
	var valChange = escapeRegExp(myInput);
	chrome.tabs.query({active:true,currentWindow:true}, function(tab) {
  chrome.tabs.sendMessage(tab[0].id, {stuff:valChange});
});
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function clickHandler(){
var person = document.getElementById("inputTxt").value;
chrome.storage.local.set({"person": person}, chrome.tabs.reload());
}


