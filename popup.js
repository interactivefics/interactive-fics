
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('submit').addEventListener('click', clickHandler);
  document.getElementById('clear-name').addEventListener('click', function(){ chrome.storage.local.remove("person", chrome.tabs.reload()) } );
  var others = document.getElementsByClassName('changeForm');
  for(var i=0; i<others.length; i++)
  	others[i].addEventListener('submit', otherHandler);
}); //instead of onclick="clickHandler()" in popup.html



function otherHandler(){
	var myInput = this.replaceWord.value;
	if(myInput){
	var valChange = escapeRegExp(myInput);
	var isYN;
	var replace;
	if(this.replaceWith){
		isYN = false;
		replace = this.replaceWith.value;
	}
	else{
		isYN = true;
		replace = 'NOPE'; // should/will never get accessed
	}
	chrome.tabs.query({active:true,currentWindow:true}, function(tab){
  	chrome.tabs.sendMessage(tab[0].id, {stuff:valChange, isYN: isYN, replaceVal:replace});
	});
 }
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function clickHandler(){
var person = document.getElementById("inputTxt").value;
if(person)
	chrome.storage.local.set({"person": person}, chrome.tabs.reload());
}


