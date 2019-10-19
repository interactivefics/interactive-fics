DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	escapeAndReplace(message.input_word, message.replace_value, message.case_sensitive)
});

const replaceAll = () => {
	chrome.storage.sync.get(null, items => {
		if (!items[DEACTIVATE_KEY]) {
			for (var key in items) {
				if (key == 'person') {
					const regexp_y_n = /\by\/n\b|\(y\/n\)|\[y\/n\]/ig
					replace(regexp_y_n, items[key])
				} else if (key !== DEACTIVATE_KEY && !key.endsWith('_case_sensitive')) {
					escapeAndReplace(key, items[key], items[`${key}_case_sensitive`])
				}
			}
		}
	})
}

const escapeAndReplace = (input_word, replace_value, case_sensitive) => {
	const input_word_escaped = escapeRegExp(input_word.trim())
	const flags = case_sensitive ? "g" : "ig"
	const regexp_input_word = new RegExp(`\\b${input_word_escaped}\\b`, flags)
	replace(regexp_input_word, replace_value)
}

const escapeRegExp = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

const replace = (input_word, replace_value) => {
	chrome.storage.sync.get(DEACTIVATE_KEY, obj => {
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
