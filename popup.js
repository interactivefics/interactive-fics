DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';
MUTATION_OBSERVER_KEY = 'observe-this-dom-pls-interactive-fics-yalla-bina';
PAUSED_KEY = 'pause-this-domain-pls-interactive-fics-yalla-bina';


document.addEventListener('DOMContentLoaded', function () {
	// event listeners
	document.getElementById('change-name-form').addEventListener('submit', changeName)
	document.getElementById('replace-other-words-form').addEventListener('submit', replaceOther)
	document.getElementById('show-saved').addEventListener('click', loadSaved)
	document.getElementById('refresh-replacements').addEventListener('click', refreshReplacements)
	document.getElementById('deactivate').addEventListener('click', toggleDeactivate)
	document.getElementById('enable-observer').addEventListener('click', toggleMutationObserver)
	document.getElementById('pause').addEventListener('click', togglePauseDomain)

	// set settings buttons
	setDeactivateKey()
	setMutationObserverKey()
	setPauseDomainKey()
	addToucanBanner()
});


const changeName = () => {
	const person = document.getElementById('change-name-form-text').value
	if (person) {
		chrome.storage.sync.set({'person': person}, chrome.tabs.reload())
	}
}

const replaceOther = () => {
	const input_word = document.getElementById('replace-word').value
	const replacement = document.getElementById('replace-with').value
	const is_case_sensitive = document.getElementById('is-case-sensitive').checked
	if (input_word && replacement) {
		if (document.getElementById('is-perm').checked) {
			const obj = {}
			obj[input_word] = replacement
			obj[`${input_word}_case_sensitive`] = is_case_sensitive
			chrome.storage.sync.set(obj)
		}

		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{
					input_word: input_word,
					replace_value: replacement,
					case_sensitive: is_case_sensitive
				})
		})
	}
}

const refreshReplacements = () => {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{
				refresh: true
			})
	})
}

const loadSaved = () => {
	const list = document.getElementById('saved-items-list')
	list.innerHTML = ''
	chrome.storage.sync.get(null, loadSavedItemsWrapper(false))
	chrome.storage.local.get(null, loadSavedItemsWrapper(true))
}

const loadSavedItemsWrapper = isLocal => items => loadSavedItems(items, isLocal)

const loadSavedItems = (items, isLocal) => {
	const list = document.getElementById('saved-items-list')
	for (var key in items) {
		if (key !== DEACTIVATE_KEY && key !== MUTATION_OBSERVER_KEY && key !== PAUSED_KEY && !key.endsWith('_case_sensitive')) {
			const label = key === 'person' ? 'Y/N' : key
			const case_sensitive = !!items[`${key}_case_sensitive`]
			const case_sensitive_string = case_sensitive ? 'case sensitive' : 'not case sensitive'
			const representative = `${label} -> ${items[key]} (${case_sensitive_string})`
			const list_item = createListItem(key, representative, 'one-saved-item', isLocal)
			list.appendChild(list_item)
		}
	}
}

const createListItem = (id, text, className, isLocal) => {
	const text_node = document.createTextNode(text)
	const list_node = document.createElement('LI')
	list_node.appendChild(text_node)
	list_node.className = className
	list_node.id = id
	list_node.addEventListener('click', () => {
		if (isLocal) {
			chrome.storage.local.remove(id)
		} else {
			chrome.storage.sync.remove(id)
		}
		list_node.className += ' strikethrough'
	})
	return list_node
}


const setDeactivateKey = () => {
	chrome.storage.sync.get(DEACTIVATE_KEY, obj => {
		const is_deactivated = obj[DEACTIVATE_KEY]
		toggleDeactivateLabel(is_deactivated)

		if (is_deactivated) {
			const other_elements = document.getElementsByClassName('fade-when-deactivate')
			const deactivate_only_elements = document.getElementsByClassName('fade-when-deactivate-only')
			Array.from([...other_elements, ...deactivate_only_elements]).forEach(element => {
				element.style.opacity = '0.5'
			})
			const input_elements = document.getElementsByTagName('INPUT')
			Array.from(input_elements).forEach(input => {
				if (input.id !== 'deactivate') {
					input.disabled = 'disabled'
				}
			})
		}
	})
}

const setMutationObserverKey = () => {
	chrome.storage.sync.get(MUTATION_OBSERVER_KEY, obj => {
		const is_enabled = obj[MUTATION_OBSERVER_KEY]
		toggleMutationObserverLabel(is_enabled)
	})
}

const setPauseDomainKey = () => {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		const hostname = new URL(tabs[0].url).hostname
		document.getElementById('this-url').innerHTML = hostname

		const storage_key = {}
		storage_key[PAUSED_KEY] = []
		chrome.storage.sync.get(storage_key, obj => {
			const hostnames = obj[PAUSED_KEY]
			const is_paused = hostnames.indexOf(hostname) !== -1
			togglePauseDomainLabel(is_paused)

			if (is_paused) {
				const other_elements = document.getElementsByClassName('fade-when-deactivate')
				const pause_only_other_elements = document.getElementsByClassName('fade-when-pause')
				Array.from([...other_elements, ...pause_only_other_elements]).forEach(element => {
					element.style.opacity = '0.5'
				})
				const input_elements = document.getElementsByTagName('INPUT')
				Array.from(input_elements).forEach(input => {
					if (input.id !== 'pause' && input.id !== 'deactivate') {
						input.disabled = 'disabled'
					}
				})
			}
		})
	})
}

const toggleDeactivateLabel = (isDeactivated) => {
	document.getElementById('deactivate').checked = isDeactivated;

}

const toggleMutationObserverLabel = (isEnabled) => {
	document.getElementById('enable-observer').checked = isEnabled;
}

const togglePauseDomainLabel = (isPaused) => {
	document.getElementById('pause').checked = isPaused;
}

const toggleDeactivate = () => {
	chrome.storage.sync.get(DEACTIVATE_KEY, obj => {
		const was_deactivated = obj[DEACTIVATE_KEY]
		toggleDeactivateLabel(!was_deactivated)

		if (was_deactivated) {
			chrome.storage.sync.remove(DEACTIVATE_KEY)
		} else {
			const new_object = {}
			new_object[DEACTIVATE_KEY] = true
			chrome.storage.sync.set(new_object)
		}

		chrome.tabs.reload()
		window.close()
	})
}

const toggleMutationObserver = () => {
	chrome.storage.sync.get(MUTATION_OBSERVER_KEY, obj => {
		const was_enabled = obj[MUTATION_OBSERVER_KEY]

		if (was_enabled) {
			chrome.storage.sync.remove(MUTATION_OBSERVER_KEY)
		} else {
			const new_object = {}
			new_object[MUTATION_OBSERVER_KEY] = true
			chrome.storage.sync.set(new_object)
		}

		chrome.tabs.reload()
	})
}

const togglePauseDomain = () => {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		const hostname = new URL(tabs[0].url).hostname

		const storage_key = {}
		storage_key[PAUSED_KEY] = []
		chrome.storage.sync.get(storage_key, obj => {
			const hostnames = obj[PAUSED_KEY]
			const was_paused = hostnames.indexOf(hostname) !== -1
			var new_hostnames;

			if (was_paused) {
				new_hostnames = hostnames.filter(h => h !== hostname)
			} else {
				new_hostnames = hostnames
				new_hostnames.push(hostname)
			}

			const new_obj = {}
			new_obj[PAUSED_KEY] = new_hostnames
			chrome.storage.sync.set(new_obj)

			chrome.tabs.reload()
			window.close()
		})
	})
}

const addToucanBanner = () => {
	const img = document.createElement('img')
	img.src = chrome.extension.getURL('toucan-banner.png')
	document.getElementById('toucan-link').appendChild(img)
}
