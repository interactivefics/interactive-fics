const DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';
const MUTATION_OBSERVER_KEY = 'observe-this-dom-pls-interactive-fics-yalla-bina';
const PAUSED_KEY = 'pause-this-domain-pls-interactive-fics-yalla-bina';
const ENABLE_COPY_KEY = 'enable-copy-everywhere-interactive-fics-yalla-bina';
const ENABLE_COPY_HOSTS_KEY = 'enable-copy-hosts-interactive-fics-yalla-bina';
const ENABLE_COPY_PENDING_FLASH_HOSTS_KEY = 'enable-copy-pending-flash-hosts-interactive-fics-yalla-bina';
const PROTECTED_REPLACEMENTS_KEY = 'protected-replacements-interactive-fics-yalla-bina';
const REVIEW_MODE_KEY = 'review-mode-interactive-fics-yalla-bina';
const HEAVY_DOMAINS = ['facebook.com','twitter.com','x.com','instagram.com','tiktok.com','reddit.com','linkedin.com','youtube.com','discord.com','slack.com','pinterest.com','tumblr.com','snapchat.com','whatsapp.com','web.whatsapp.com','netflix.com','twitch.tv'];

const isHeavyDomain = (hostname) => {
	return HEAVY_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
};

const originalTextNodes = new WeakMap()
window.originalTextNodes = originalTextNodes
let replaceCount = 0
const temporaryReplacementRules = []
let replaceAllTimer = null
let mutationObserver = null
let storageItems = null
let storageLoadPromise = null

const loadStorageItems = () => {
	if (storageItems) return Promise.resolve(storageItems)
	if (!storageLoadPromise) {
		storageLoadPromise = Promise.all([
			new Promise(resolve => chrome.storage.sync.get(null, resolve)),
			new Promise(resolve => chrome.storage.local.get(null, resolve))
		]).then(([syncItems, localItems]) => {
			storageItems = Object.assign({}, syncItems, localItems)
			return storageItems
		}).finally(() => { storageLoadPromise = null })
	}
	return storageLoadPromise
}

chrome.storage.onChanged.addListener((changes, area) => {
	if (!storageItems) return
	for (const [key, change] of Object.entries(changes)) {
		if (change.newValue === undefined) delete storageItems[key]
		else storageItems[key] = change.newValue
	}
	scheduleReplaceAll()
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if ('input_word' in message){
		const rule = createReplacementRule(message.input_word, message.replace_value, message.case_sensitive)
		if (rule) {
			temporaryReplacementRules.push(rule)
			replaceAll()
		}
	} else {
		replaceAll()
	}
});

const whenDomIsReady = callback => {
	if (document.body) {
		callback()
	} else {
		document.addEventListener('DOMContentLoaded', callback, { once: true })
	}
}

const replaceAll = () => {
	whenDomIsReady(() => {
		loadStorageItems().then(replaceAllInStorage)
	})
}

const observeChanges = () => {
	chrome.storage.sync.get([MUTATION_OBSERVER_KEY, 'allow-heavy-sites'], obj => {
		if (obj[MUTATION_OBSERVER_KEY] === false) return;
		const hostname = window.location.hostname;
		if (isHeavyDomain(hostname) && obj['allow-heavy-sites'] !== true) return;
		if (!mutationObserver) {
			mutationObserver = new MutationObserver((mutations) => {
				if (mutationsContainExternalNodes(mutations)) scheduleReplaceAll();
			});
			const target = document.body || document.documentElement;
			mutationObserver.observe(target, {
				subtree: true,
				childList: true
			});
		}
	});
};

const mutationsContainExternalNodes = mutations => mutations.some(mutation =>
		Array.from(mutation.addedNodes).some(node =>
			node.nodeType === Node.TEXT_NODE ||
			(node.nodeType === Node.ELEMENT_NODE && !node.closest?.('#if-review-style, .if-review'))
		)
)

const scheduleReplaceAll = () => {
	clearTimeout(replaceAllTimer)
	replaceAllTimer = setTimeout(replaceAll, 150)
}

const replaceAllInStorage = (items) => {
	const hostname = window.location.hostname
	if (isHeavyDomain(hostname) && items['allow-heavy-sites'] !== true) {
		return;
	}
	const is_paused = items[PAUSED_KEY] && items[PAUSED_KEY].indexOf(hostname) !== -1
	if (!items[DEACTIVATE_KEY] && !is_paused) {
		const replacement_rules = getReplacementRules(items).concat(temporaryReplacementRules)
		if (items[REVIEW_MODE_KEY]) {
			highlightDocument(replacement_rules)
		} else {
			replaceCount = 0
			replaceDocument(replacement_rules)
		}
		if (replacement_rules.length > 0 && replaceCount > 0) {
			try { chrome.runtime.sendMessage({ type: 'set-badge', text: String(replaceCount) }, () => { void chrome.runtime.lastError; }); } catch (e) {}
		} else if (replacement_rules.length > 0) {
			try { chrome.runtime.sendMessage({ type: 'set-badge', text: '✓' }, () => { void chrome.runtime.lastError; }); } catch (e) {}
		}
	} else {
	}
}

const getReplacementRules = items => {
	const replacement_rules = []
	for (var key in items) {
		if (key == 'person') {
			const rule = createPersonReplacementRule(items[key])
			if (rule) {
				replacement_rules.push(rule)
			}
		} else if (isReplacementKey(key)) {
			const rule = createReplacementRule(key, items[key], items[`${key}_case_sensitive`])
			if (rule) {
				replacement_rules.push(rule)
			}
		}
	}
	return replacement_rules
}

const isReplacementKey = key => {
	return key !== DEACTIVATE_KEY &&
		key !== MUTATION_OBSERVER_KEY &&
		key !== PAUSED_KEY &&
		key !== ENABLE_COPY_KEY &&
		key !== ENABLE_COPY_HOSTS_KEY &&
		key !== ENABLE_COPY_PENDING_FLASH_HOSTS_KEY &&
		key !== PROTECTED_REPLACEMENTS_KEY &&
		key !== 'stv-decode-enabled-interactive-fics' &&
		key !== 'review-mode-interactive-fics-yalla-bina' &&
		!key.startsWith('stv-map-') &&
		!key.endsWith('_case_sensitive')
}

const createPersonReplacementRule = replace_value => {
	if (!replace_value) { return null }
	return {
		regexp: /\(y\/n\)|\[y\/n\]|\(s\/n\)|\[s\/n\]|\by\/n\b|\byn\b|\bs\/n\b/ig,
		replace_value: replace_value
	}
}

const createReplacementRule = (input_word, replace_value, case_sensitive) => {
	if (!input_word || !replace_value) { return null }
	let input_word_escaped = escapeRegExp(input_word.trim())
	if (input_word_escaped.length == 0) { return null }
	const flags = case_sensitive ? "g" : "ig"
	if (input_word_escaped[0].match(/[a-z]/i)) {
		input_word_escaped = `\\b${input_word_escaped}`
	}
	if (input_word_escaped[input_word_escaped.length - 1].match((/[a-z]/i))) {
		input_word_escaped = `${input_word_escaped}\\b`
	}
	return {
		regexp: new RegExp(input_word_escaped, flags),
		replace_value: replace_value
	}
}

const highlightDocument = (replacementRules) => {
	if (!document.body) { return }
	// inject styles once
	if (!document.getElementById('if-review-style')) {
		const style = document.createElement('style')
		style.id = 'if-review-style'
		style.textContent = '.if-review{background:#fff3cd;border:1px dashed #ffc107;border-radius:3px;padding:0 2px;cursor:pointer;} .if-review:hover{background:#ffe08a;} .if-review-done{background:#d4edda;border:1px solid #28a745;}';
		(document.head || document.documentElement).appendChild(style)
	}
	replacementRules.forEach(rule => {
		const regex = new RegExp(rule.regexp.source, rule.regexp.flags.replace('g','') + 'g')
		// walk text nodes
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)
		const nodes = []
		let n
		while (n = walker.nextNode()) nodes.push(n)
		for (const textNode of nodes) {
			if (!textNode.parentElement) continue
			if (textNode.parentElement.classList && textNode.parentElement.classList.contains('if-review')) continue
			if (shouldSkipElement(textNode.parentElement)) continue
			const text = textNode.nodeValue
			if (!regex.test(text)) { regex.lastIndex = 0; continue }
			regex.lastIndex = 0
			const frag = document.createDocumentFragment()
			let last = 0
			let m
			while ((m = regex.exec(text)) !== null) {
				if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
				const span = document.createElement('span')
				span.className = 'if-review'
				span.textContent = m[0]
				span.dataset.original = m[0]
				span.dataset.replacement = rule.replace_value
				span.addEventListener('click', () => {
					span.textContent = rule.replace_value
					span.classList.remove('if-review')
					span.classList.add('if-review-done')
				})
				frag.appendChild(span)
				last = m.index + m[0].length
				if (m[0].length === 0) regex.lastIndex++
			}
			if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
			if (frag.childNodes.length > 0) textNode.parentNode.replaceChild(frag, textNode)
		}
	})
}

const replaceDocument = replacementRules => {
	if (!document.body) { return }
	walk(document.body, replacementRules)
}

const applyReplacementRules = (text, replacementRules) => {
	let node_value = text
	replacementRules.forEach(rule => {
		node_value = node_value.replace(rule.regexp, rule.replace_value)
	})
	return node_value
}

const escapeRegExp = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

const replaceText = (textNode, replacementRules) => {
	if (!originalTextNodes.has(textNode)) {
		originalTextNodes.set(textNode, textNode.nodeValue)
	}

	const original_node_value = originalTextNodes.get(textNode)
	const new_value = applyReplacementRules(original_node_value, replacementRules)
	if (new_value !== original_node_value) {
		replaceCount++
	}
	textNode.nodeValue = new_value
}

const shouldSkipElement = element => {
	if (!element) { return false }
	if (element.isContentEditable) { return true }
	if (element.closest && element.closest('[contenteditable="true"]')) { return true }

	const tag_name = element.tagName ? element.tagName.toLowerCase() : ''
	return tag_name === 'input' ||
		tag_name === 'textarea' ||
		tag_name === 'select' ||
		tag_name === 'option' ||
		tag_name === 'script' ||
		tag_name === 'style' ||
		tag_name === 'noscript'
}

function walk(node, replacementRules){
	if (!node) { return }

	switch (node.nodeType){
		case 1:  // Element
			if (shouldSkipElement(node)) { return }
		case 9:  // Document
		case 11: // Document fragment
			var child = node.firstChild
			var next
			while (child){
				next = child.nextSibling
				walk(child, replacementRules)
				child = next
			}
			break
		case 3: // Text node
			if (!shouldSkipElement(node.parentElement)) {
				replaceText(node, replacementRules)
			}
			break
	}
}

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'observe-changes') {
      try { observeChanges(); } catch (e) {}
      return;
    }
    if (msg && msg.type === 'quick-replace' && msg.text) {
      const selText = msg.text;
      const val = window.prompt('Substituir "' + selText + '" por:', '');
      if (val === null || val === '') return;
      const doReplace = () => {
        const re = new RegExp(selText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
          const v = node.nodeValue;
          const nv = v.replace(re, val);
          if (nv !== v) node.nodeValue = nv;
        }
        chrome.storage.sync.set({ [selText]: val, [selText + '_case_sensitive']: false });
      };
      if (typeof window.stvDecodeAll === 'function') {
        window.stvDecodeAll().then(doReplace).catch(doReplace);
      } else {
        doReplace();
      }
    }
  });

replaceAll()
observeChanges()
