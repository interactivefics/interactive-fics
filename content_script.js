var valChange = /\by\/n\b|\(y\/n\)|\[y\/n\]/ig;
var person;
chrome.storage.local.get("person", function(value){
	person = value.person;
	if(person){
		loadReplace(valChange, person);
	}
});
// loadReplace(valChange);

chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
  //This is where the stuff you want from the background page will be
  var val = new RegExp(message.stuff, "ig");
  if(message.isYN)
  	loadReplace(val, person);
  else
  	if(message.replaceVal){
  		loadReplace(val, message.replaceVal);
  	}
});


function loadReplace(rep, p){
	if(p!=null)
		walk(document.body, rep, p);
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

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    loadReplace(valChange, person);
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  childList: true
  //...
});
