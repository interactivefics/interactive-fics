DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';
MUTATION_OBSERVER_KEY = 'observe-this-dom-pls-interactive-fics-yalla-bina';
PAUSED_KEY = 'pause-this-domain-pls-interactive-fics-yalla-bina';


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if ('input_word' in message){
		escapeAndReplace(message.input_word, message.replace_value, message.case_sensitive)
	} else {
		replaceAll()
	}
});

const replaceAll = () => {
	chrome.storage.sync.get(null, replaceAllInStorage)
	chrome.storage.local.get(null, replaceAllInStorage)
}

const observeChanges = () => {
	chrome.storage.sync.get(MUTATION_OBSERVER_KEY, obj => {
		if (obj[MUTATION_OBSERVER_KEY]) {
			const observer = new MutationObserver((mutation_list, observer) => {
				replaceAll()
			})
			observer.observe(document, {
				subtree: true,
				childList: true
			})
		}
	})
}

const replaceAllInStorage = (items) => {
	const hostname = window.location.hostname
	const is_paused = items[PAUSED_KEY] && items[PAUSED_KEY].indexOf(hostname) !== -1
	if (!items[DEACTIVATE_KEY] && !is_paused) {
		// Collect replacement keys with the length of the text they actually match
		const replacements = []
		for (var key in items) {
			if (key == 'person') {
				// matches "y/n" (3) / "(y/n)" / "[y/n]" — use the core length so it
				// runs AFTER any longer custom pattern that contains it
				replacements.push({ key, length: 3 })
			} else if (
				key !== DEACTIVATE_KEY &&
				key !== MUTATION_OBSERVER_KEY &&
				key !== PAUSED_KEY &&
				!key.endsWith('_case_sensitive')
			) {
				replacements.push({ key, length: key.trim().length })
			}
		}

		// Longest match first, so larger patterns are replaced before the
		// shorter patterns they contain (e.g. "y/n/n" before "y/n")
		replacements.sort((a, b) => b.length - a.length)

		for (const { key } of replacements) {
			if (key == 'person') {
				const regexp_y_n = /\by\/n\b|\(y\/n\)|\[y\/n\]/ig
				replace(regexp_y_n, items[key])
			} else {
				escapeAndReplace(key, items[key], items[`${key}_case_sensitive`])
			}
		}
	}
}

const escapeAndReplace = (input_word, replace_value, case_sensitive) => {
	if (input_word.length == 0) { return; }
	let input_word_escaped = escapeRegExp(input_word.trim())
	const flags = case_sensitive ? "g" : "ig"
	if (input_word_escaped[0].match(/[a-z]/i)) {
		input_word_escaped = `\\b${input_word_escaped}`
	}
	if (input_word_escaped[input_word_escaped.length - 1].match((/[a-z]/i))) {
		input_word_escaped = `${input_word_escaped}\\b`
	}
	const regexp_input_word = new RegExp(input_word_escaped, flags)
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
	// I stole the base to this function from here:
	// http://is.gd/mwZp7E
	if (node.contentEditable != 'true' && node.type != 'textarea' && node.type != 'input') {
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
}

replaceAll()
observeChanges()
