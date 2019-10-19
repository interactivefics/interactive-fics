DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	escapeAndReplace(message.input_word, message.replace_value)
});

const replaceAll = () => {
	chrome.storage.local.get(null, items => {
		if (!items[DEACTIVATE_KEY]) {
			for (var key in items) {
				if (key == 'person') {
					const regexp_y_n = /\by\/n\b|\(y\/n\)|\[y\/n\]/ig
					replace(regexp_y_n, items[key])
				} else if (key !== DEACTIVATE_KEY) {
					escapeAndReplace(key, items[key])
				}
			}
		}
	})
}

const escapeAndReplace = (input_word, replace_value) => {
	const input_word_escaped = escapeRegExp(input_word.trim())
	const regexp_input_word = new RegExp(`\\b${input_word_escaped}\\b`, "ig")
	replace(regexp_input_word, replace_value)
}

const escapeRegExp = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

const replace = (input_word, replace_value) => {
	chrome.storage.local.get(DEACTIVATE_KEY, obj => {
		if (replace_value && !obj[DEACTIVATE_KEY]) {
			walk(document.body, input_word, replace_value)
		}
	})
}

const replaceText = (textNode, input_word, replace_value) => {
	let node_value = textNode.nodeValue
	node_value = node_value.replace(input_word, replace_value)
	textNode.nodeValue = node_value
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
			replaceText(node, v, p);
			break;
	}
}

replaceAll()
