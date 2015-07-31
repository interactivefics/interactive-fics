var valChange = /\by\/n\b|\(y\/n\)|\[y\/n\]/ig;

chrome.extension.onMessage.addListener(function(message,sender,sendResponse){
  //This is where the stuff you want from the background page will be
  valChange = new RegExp(message.stuff, "ig");
  loadReplace();
});

var person;

loadReplace();

function loadReplace()
{
chrome.storage.local.get("person", function(value)
{
person = value.person;
if(person != null){walk(document.body);}

}
)
}

function walk(node) 
{
	// I stole this function from here:
	// http://is.gd/mwZp7E
	
	var child, next;

	switch ( node.nodeType )  
	{
		case 1:  // Element
		case 9:  // Document
		case 11: // Document fragment
			child = node.firstChild;
			while ( child ) 
			{
				next = child.nextSibling;
				walk(child);
				child = next;
			}
			break;

		case 3: // Text node
			handleText(node);
			break;
	}
}

function handleText(textNode) 
{
	var v = textNode.nodeValue;	
	v = v.replace(valChange, person); //replaces Y/N or other value entered regardless of the case, whether it's in a bracket or not

	textNode.nodeValue = v;
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    loadReplace();
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  childList: true
  //...
});
