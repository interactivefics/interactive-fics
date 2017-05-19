DISABLE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';

var valChange = /\by\/n\b|\(y\/n\)|\[y\/n\]/ig;
var person;
var replaceAll = function (){
	chrome.storage.local.get(null, function(items){
		if(items[DISABLE_KEY] !== true){
			for(var key in items){
				if(items[key]){
					if(key=="person")
						loadReplace(valChange, items[key]);
					else if(key !== DISABLE_KEY){
						var s = escapeRegExp(key);
						var temp = new RegExp(s, "ig");
						loadReplace(temp, items[key]);
					}
				}
			}
		}
	});
}


function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
  var s = escapeRegExp(message.stuff);
  var val = new RegExp(s, "ig");
  if(message.isYN)
  	loadReplace(val, person);
  else
  	if(message.replaceVal){
  		loadReplace(val, message.replaceVal);
  	}
});


function loadReplace(rep, p){
	chrome.storage.local.get(DISABLE_KEY, function(obj){
		var enabled = obj[DISABLE_KEY] !== true;
		if(p!=null && enabled){
			walk(document.body, rep, p);
		}
	});
}

function walk(node, v, p){
	// I stole this function from here:
	// http://is.gd/mwZp7E
	var child, next;
	switch (node.nodeType){
		case 1:  // Element
		case 9:  // Document
		case 11: // Document fragment
			child = node.firstChild;
			while (child){
				next = child.nextSibling;
				walk(child, v, p);
				child = next;
			}
			break;
		case 3: // Text node
			handleText(node, v, p);
			break;
	}
}

function handleText(textNode, val, p){
	var v = textNode.nodeValue;	
	v = v.replace(val, p); //replaces Y/N or other value entered regardless of the case, whether it's in a bracket or not
	textNode.nodeValue = v;
}

replaceAll();