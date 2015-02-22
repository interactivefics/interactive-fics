var person;

loadReplace();

function loadReplace()
{
chrome.storage.local.get("person", function(value)
{
person = value.person;
walk(document.body);
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

	v = v.replace("Y/N", person);
	v = v.replace("y/n", person);
	v = v.replace("Y/n", person);
	v = v.replace("y/N", person);
	v = v.replace("(Y/N)", person);
	v = v.replace("(y/n)", person);
	v = v.replace("(Y/n)", person);
	v = v.replace("(y/N)", person);
	v = v.replace("Y/N?", person + "?");
	v = v.replace("y/n?", person + "?");
	v = v.replace("Y/n?", person + "?");
	v = v.replace("y/N?", person + "?");
	v = v.replace("Y/N!", person + "!");
	v = v.replace("y/n!", person + "!");
	v = v.replace("Y/n!", person + "!");
	v = v.replace("y/N!", person + "!");
	v = v.replace("(Y/N)?", person + "?");
	v = v.replace("(y/n)?", person + "?");
	v = v.replace("(Y/n)?", person + "?");
	v = v.replace("(y/N)?", person + "?");
	v = v.replace("(Y/N)!", person + "!");
	v = v.replace("(y/n)!", person + "!");
	v = v.replace("(Y/n)!", person + "!");
	v = v.replace("(y/N)!", person + "!");
	
	
	
	textNode.nodeValue = v;
}


