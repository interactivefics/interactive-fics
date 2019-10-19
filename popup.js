DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';

document.addEventListener('DOMContentLoaded', function () {
	// event listeners
	document.getElementById('change-name-form').addEventListener('submit', changeName)
	document.getElementById('clear-name-form').addEventListener('submit', clearName)
	document.getElementById('replace-other-words-form').addEventListener('submit', replaceOther)
	document.getElementById('show-saved').addEventListener('click', loadSaved)
	document.getElementById('deactivate').addEventListener('click', toggleDeactivate)

	// set disable/enable button
	setDeactivateKey()
});


const changeName = () => {
	const person = document.getElementById('change-name-form-text').value
	if (person) {
		chrome.storage.local.set({'person': person}, chrome.tabs.reload())
	}
}

const clearName = () => {
	chrome.storage.local.remove('person', chrome.tabs.reload())
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
			chrome.storage.local.set(obj)
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

const loadSaved = () => {
	chrome.storage.local.get(null, items => {
		const list = document.getElementById('saved-items-list')
		list.innerHTML = ''
		let hasItems = false
		for (var key in items) {
			if (key !== DEACTIVATE_KEY) {
				const label = key === 'person' ? 'Y/N' : key
				const representative = `${label} -> ${items[key]}`
				const list_item = createListItem(key, representative, 'one-saved-item')
				list.appendChild(list_item)
				hasItems = true
			}
		}
		if (!hasItems) {
			list.innerHTML = '<small>No stored replacements yet!</small>'
		}
	})
}

const createListItem = (id, text, className) => {
	const text_node = document.createTextNode(text)
	const list_node = document.createElement('LI')
	list_node.appendChild(text_node)
	list_node.className = className
	list_node.id = id
	list_node.addEventListener('click', () => {
		chrome.storage.local.remove(id)
		list_node.className += ' strikethrough'
	})
	return list_node
}


const setDeactivateKey = () => {
	chrome.storage.local.get(DEACTIVATE_KEY, obj => {
		const is_deactivated = obj[DEACTIVATE_KEY]
		toggleDeactivateLabel(is_deactivated)

		if (is_deactivated) {
			const other_elements = document.getElementById('all-but-deactivate-wrapper')
			other_elements.style.opacity = '0.5'
			const input_elements = document.getElementsByTagName('INPUT')
			Array.from(input_elements).forEach(input => {
				if (input.id !== 'deactivate') {
					input.disabled = 'disabled'
				}
			})
		}
	})
}

const toggleDeactivateLabel = (reactivateBool) => {
	const prefix = reactivateBool ? 'Re-activate' : 'Deactivate'
	const deactivate_button = document.getElementById('deactivate')
	deactivate_button.value = `${prefix} Extension`
}

const toggleDeactivate = () => {
	chrome.storage.local.get(DEACTIVATE_KEY, obj => {
		const was_deactivated = obj[DEACTIVATE_KEY]
		toggleDeactivateLabel(!was_deactivated)

		if (was_deactivated) {
			chrome.storage.local.remove(DEACTIVATE_KEY)
		} else {
			const new_object = {}
			new_object[DEACTIVATE_KEY] = true
			chrome.storage.local.set(new_object)
		}

		chrome.tabs.reload()
		window.close()
	})
}
