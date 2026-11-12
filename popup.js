const DEACTIVATE_KEY = 'deactivate-this-extension-pls-interactive-fics-yalla-bina';
const MUTATION_OBSERVER_KEY = 'observe-this-dom-pls-interactive-fics-yalla-bina';
const PAUSED_KEY = 'pause-this-domain-pls-interactive-fics-yalla-bina';
const LEGACY_ENABLE_COPY_KEY = 'enable-copy-everywhere-interactive-fics-yalla-bina';
const ENABLE_COPY_HOSTS_KEY = 'enable-copy-hosts-interactive-fics-yalla-bina';
const ENABLE_COPY_PENDING_FLASH_HOSTS_KEY = 'enable-copy-pending-flash-hosts-interactive-fics-yalla-bina';
const PROTECTED_REPLACEMENTS_KEY = 'protected-replacements-interactive-fics-yalla-bina';

const I18N = {
	pt: {
		replace_other_q: 'Precisa substituir algo além de Y/N?',
		replace_other_hint: 'Essa alteração some ao atualizar ou trocar de página, a menos que você marque "Salvar esta substituição".',
		value_label: 'Valor (ex.: L/N, E/C etc):',
		case_sensitive: 'Diferenciar maiúsculas/minúsculas',
		replace_with_label: 'Substituir por:',
		save_replacement: 'Salvar esta substituição',
		change_btn: 'Alterar',
		saved_replacements: 'Substituições salvas',
		saved_hint: 'Use os botões para editar, proteger ou apagar. "Apagar tudo" mantém os itens protegidos.',
		delete_all: 'Apagar tudo',
		delete_all_title: 'Apaga todas as substituições salvas, mantendo as protegidas',
		export: 'Exportar',
		import: 'Importar',
		settings: 'Configurações',
		section_general: 'Geral',
		section_advanced: 'Avançado',
		detect_changes: 'Detectar mudanças na página',
		enable_copy: 'Ativar Cópia em',
		pause_site: 'Pausar extensão em',
		deactivate: 'Desativar extensão',
		deactivate_title: 'Desliga todas as funcionalidades em todos os sites. A página precisa ser recarregada.',
		decode_stv: 'Decodificar sangtacviet',
		review_mode: 'Modo revisão',
		filter_placeholder: 'Filtrar...',
		edit: 'Editar', protect: 'Proteger', unprotect: 'Desproteger', delete: 'Apagar',
		case_sensitive_on: 'diferencia maiúsculas/minúsculas', case_sensitive_off: 'não diferencia maiúsculas/minúsculas',
		local_temporary: 'temporário/local', saved: 'salvo', protected: 'Protegido',
		protected_item: 'Este item está protegido', delete_item: 'Apagar este item',
		invalid_file: 'Arquivo inválido', cache_cleared: 'Cache limpo: {count} entrada(s)', empty_cache: 'Cache vazio',
		theme_help: 'Alterna entre o tema claro e o tema escuro.', review_help: 'Destaca cada substituição para confirmação individual.', stv_help: 'Decodifica textos protegidos por fonte no Sangtacviet.', observer_help: 'Detecta conteúdo novo carregado e aplica as substituições.', copy_help: 'Permite copiar em sites que bloqueiam essa ação.',
	},
	en: {
		replace_other_q: 'Need to replace something other than Y/N?',
		replace_other_hint: 'This change disappears on refresh or when you switch pages, unless you check "Save this replacement".',
		value_label: 'Value (e.g.: L/N, E/C etc):',
		case_sensitive: 'Case sensitive',
		replace_with_label: 'Replace with:',
		save_replacement: 'Save this replacement',
		change_btn: 'Apply',
		saved_replacements: 'Saved replacements',
		saved_hint: 'Use the buttons to edit, protect or delete. "Delete all" keeps protected items.',
		delete_all: 'Delete all',
		delete_all_title: 'Deletes all saved replacements, keeping the protected ones',
		export: 'Export',
		import: 'Import',
		settings: 'Settings',
		section_general: 'General',
		section_advanced: 'Advanced',
		detect_changes: 'Detect page changes',
		enable_copy: 'Enable Copy on',
		pause_site: 'Pause extension on',
		deactivate: 'Disable extension',
		deactivate_title: 'Turns off all features on all sites. The page must be reloaded.',
		decode_stv: 'Decode sangtacviet',
		review_mode: 'Review mode',
		filter_placeholder: 'Filter...',
		edit: 'Edit', protect: 'Protect', unprotect: 'Unprotect', delete: 'Delete',
		case_sensitive_on: 'case sensitive', case_sensitive_off: 'case insensitive',
		local_temporary: 'temporary/local', saved: 'saved', protected: 'Protected',
		protected_item: 'This item is protected', delete_item: 'Delete this item',
		invalid_file: 'Invalid file', cache_cleared: 'Cache cleared: {count} entr(y/ies)', empty_cache: 'Cache empty',
		theme_help: 'Switches between the light and dark themes.', review_help: 'Highlights each replacement for individual confirmation.', stv_help: 'Decodes font-obfuscated text on Sangtacviet.', observer_help: 'Detects newly loaded content and applies replacements.', copy_help: 'Allows copying on sites that block this action.',
	}
};

let currentLang = 'pt';

function setLang(lang) {
	chrome.storage.sync.set({ 'if-lang': lang }, () => applyLang(lang));
}

function applyTheme(dark) {
	document.body.classList.toggle('dark', dark);
	const btn = document.getElementById('theme-toggle');
	if (btn) btn.textContent = dark ? '☀️' : '🌙';
}

function toggleTheme() {
	const dark = !document.body.classList.contains('dark');
	chrome.storage.sync.set({ 'if-theme': dark ? 'dark' : 'light' }, () => applyTheme(dark));
}

function applyLang(lang) {
	currentLang = lang;
	const dict = I18N[lang] || I18N.pt;
	document.querySelectorAll('[data-i18n]').forEach(el => {
		const key = el.getAttribute('data-i18n');
		if (dict[key] !== undefined) el.textContent = dict[key];
	});
	document.querySelectorAll('[data-i18n-value]').forEach(el => {
		const key = el.getAttribute('data-i18n-value');
		if (dict[key] !== undefined) el.value = dict[key];
	});
	document.querySelectorAll('[data-i18n-title]').forEach(el => {
		const key = el.getAttribute('data-i18n-title');
		if (dict[key] !== undefined) el.title = dict[key];
	});
	document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
		const key = el.getAttribute('data-i18n-placeholder');
		if (dict[key] !== undefined) el.placeholder = dict[key];
	});
	const langButton = document.getElementById('lang-toggle');
	if (langButton) {
		const flag = langButton.querySelector('.flag');
		const isEnglish = lang === 'en';
		if (flag) {
			flag.src = isEnglish ? 'flag-us.svg' : 'flag-br.svg';
			flag.alt = isEnglish ? 'United States' : 'Brasil';
		}
		langButton.title = 'Clique para trocar para inglês\nClick to switch to Portuguese';
		langButton.dataset.tooltip = langButton.title;
		langButton.setAttribute('aria-label', langButton.title);
	}
}


document.addEventListener('DOMContentLoaded', function () {
	// event listeners
	document.getElementById('replace-other-words-form').addEventListener('submit', replaceOther)
	document.getElementById('show-saved').addEventListener('click', loadSaved)
	document.getElementById('delete-all-saved').addEventListener('click', deleteAllSaved)
	document.getElementById('export-replacements').addEventListener('click', exportReplacements)
	document.getElementById('import-replacements').addEventListener('click', () => document.getElementById('import-file').click())
	document.getElementById('import-file').addEventListener('change', importReplacements)
	document.getElementById('deactivate').addEventListener('click', toggleDeactivate)
	document.getElementById('enable-observer').addEventListener('click', toggleMutationObserver)
	document.getElementById('review-mode').addEventListener('click', toggleReviewMode)
	document.getElementById('enable-copy-domain').addEventListener('click', toggleEnableCopyDomain)
	document.getElementById('stv-decode').addEventListener('click', toggleStvDecode)
	document.getElementById('pause').addEventListener('click', togglePauseDomain)
	document.getElementById('lang-toggle').addEventListener('click', () => setLang(currentLang === 'en' ? 'pt' : 'en'));
	document.getElementById('theme-toggle').addEventListener('click', toggleTheme)
	document.getElementById('filter-saved').addEventListener('input', (e) => {
		const q = e.target.value.toLowerCase();
		document.querySelectorAll('#saved-items-list .one-saved-item').forEach(li => {
			li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
		});
	});

	// set settings buttons
	setDeactivateKey()
	setMutationObserverKey()
	setReviewModeKey()
	setEnableCopyKeys()
	setPauseDomainKey()
	setStvDecodeKey()
	chrome.storage.sync.get('if-lang', obj => applyLang(obj['if-lang'] === 'en' ? 'en' : 'pt'))
	chrome.storage.sync.get('if-theme', obj => applyTheme(obj['if-theme'] === 'dark'))
	addToucanBanner()
});




const addToucanBanner = () => {
	const toucan_link = document.getElementById('toucan-link')
	if (!toucan_link) { return; }
}
const replaceOther = event => {
	event.preventDefault()
	const replace_word_input = document.getElementById('replace-word')
	const replace_with_input = document.getElementById('replace-with')
	const case_sensitive_input = document.getElementById('is-case-sensitive')
	const permanent_input = document.getElementById('is-perm')
	const input_word = replace_word_input.value.trim()
	const replacement = replace_with_input.value
	const is_case_sensitive = case_sensitive_input.checked
	if (input_word && replacement) {
		if (permanent_input.checked) {
			const obj = {}
			obj[input_word] = replacement
			obj[`${input_word}_case_sensitive`] = is_case_sensitive
			chrome.storage.sync.set(obj, loadSaved)
		}

		withActiveSupportedTab(tab => {
			chrome.tabs.sendMessage(
				tab.id,
				{
					input_word: input_word,
					replace_value: replacement,
					case_sensitive: is_case_sensitive
				},
				() => chrome.runtime.lastError)
		})

		replace_word_input.value = ''
		replace_with_input.value = ''
		case_sensitive_input.checked = false
		permanent_input.checked = false
	}
}

const loadSaved = () => {
	const list = document.getElementById('saved-items-list')
	list.innerHTML = ''
	chrome.storage.sync.get(null, sync_items => {
		chrome.storage.local.get(null, local_items => {
			const protected_storage_key = {}
			protected_storage_key[PROTECTED_REPLACEMENTS_KEY] = []
			chrome.storage.sync.get(protected_storage_key, protected_obj => {
				loadSavedItems(sync_items, false, protected_obj[PROTECTED_REPLACEMENTS_KEY])
				loadSavedItems(local_items, true, protected_obj[PROTECTED_REPLACEMENTS_KEY])
			})
		})
	})
}

const loadSavedItems = (items, isLocal, protected_items) => {
	const list = document.getElementById('saved-items-list')
	for (var key in items) {
		if (isReplacementKey(key)) {
			const label = key === 'person' ? 'Y/N' : key
			const case_sensitive = !!items[`${key}_case_sensitive`]
			const is_protected = protected_items.indexOf(key) !== -1
			const list_item = createListItem(key, label, items[key], case_sensitive, isLocal, is_protected)
			list.appendChild(list_item)
		}
	}
}

const isReplacementKey = key => {
	return key !== DEACTIVATE_KEY &&
		key !== MUTATION_OBSERVER_KEY &&
		key !== PAUSED_KEY &&
		key !== LEGACY_ENABLE_COPY_KEY &&
		key !== ENABLE_COPY_HOSTS_KEY &&
		key !== ENABLE_COPY_PENDING_FLASH_HOSTS_KEY &&
		key !== PROTECTED_REPLACEMENTS_KEY &&
		key !== 'stv-decode-enabled-interactive-fics' &&
		key !== 'review-mode-interactive-fics-yalla-bina' &&
		key !== 'allow-heavy-sites' &&
		key !== 'if-lang' &&
		key !== 'if-theme' &&
		!key.startsWith('stv-map-') &&
		!key.endsWith('_case_sensitive')
}

const createButton = (text, className, onClick) => {
	const button = document.createElement('button')
	button.type = 'button'
	button.textContent = text
	button.className = className
	button.addEventListener('click', onClick)
	return button
}

const createListItem = (id, label, replacement, caseSensitive, isLocal, isProtected) => {
	const list_node = document.createElement('LI')
	list_node.className = isProtected ? 'one-saved-item protected-saved-item' : 'one-saved-item'
	list_node.id = id

	const text = document.createElement('div')
	text.className = 'saved-item-text'
	const dict = I18N[currentLang] || I18N.pt
	text.textContent = `${label} -> ${replacement} (${caseSensitive ? dict.case_sensitive_on : dict.case_sensitive_off})`

	const meta = document.createElement('span')
	meta.className = 'saved-item-meta'
	meta.textContent = `${isLocal ? dict.local_temporary : dict.saved}${isProtected ? ` (#) ${dict.protected}` : ''}`
	text.appendChild(meta)

	const actions = document.createElement('div')
	actions.className = 'saved-item-actions'
	actions.appendChild(createButton(dict.edit, 'saved-action', () => showEditReplacement(list_node, id, label, replacement, caseSensitive, isLocal, isProtected)))
	actions.appendChild(createButton(isProtected ? dict.unprotect : dict.protect, 'saved-action', () => toggleProtectedReplacement(id)))

	const delete_button = createButton(dict.delete, 'saved-action danger-action small-danger', () => deleteReplacement(id, isLocal))
	delete_button.disabled = isProtected
	delete_button.title = isProtected ? dict.protected_item : dict.delete_item
	actions.appendChild(delete_button)

	list_node.appendChild(text)
	list_node.appendChild(actions)
	return list_node
}

const showEditReplacement = (listNode, id, label, replacement, caseSensitive, isLocal, isProtected) => {
	listNode.innerHTML = ''
	listNode.className = isProtected ? 'one-saved-item protected-saved-item editing-saved-item' : 'one-saved-item editing-saved-item'

	const key_input = document.createElement('input')
	key_input.type = 'text'
	key_input.value = label
	key_input.className = 'edit-replacement-key'

	const value_input = document.createElement('input')
	value_input.type = 'text'
	value_input.value = replacement
	value_input.className = 'edit-replacement-value'

	const case_label = document.createElement('label')
	case_label.className = 'edit-case-sensitive'
	const case_input = document.createElement('input')
	case_input.type = 'checkbox'
	case_input.checked = caseSensitive
	case_label.appendChild(case_input)
	case_label.appendChild(document.createTextNode('Diferenciar maiusculas/minusculas'))

	const actions = document.createElement('div')
	actions.className = 'saved-item-actions'
	actions.appendChild(createButton('Salvar', 'saved-action', () => saveEditedReplacement(id, key_input.value, value_input.value, case_input.checked, isLocal, isProtected)))
	actions.appendChild(createButton('Cancelar', 'saved-action', loadSaved))

	listNode.appendChild(key_input)
	listNode.appendChild(value_input)
	listNode.appendChild(case_label)
	listNode.appendChild(actions)
}

const normalizeReplacementKey = key => {
	const trimmed_key = key.trim()
	return trimmed_key.toLowerCase() === 'y/n' ? 'person' : trimmed_key
}

const getReplacementStorage = isLocal => isLocal ? chrome.storage.local : chrome.storage.sync

const saveEditedReplacement = (oldKey, newKeyInput, newValueInput, caseSensitive, isLocal, wasProtected) => {
	const new_key = normalizeReplacementKey(newKeyInput)
	const new_value = newValueInput.trim()
	if (!new_key || !new_value) { return; }

	const storage = getReplacementStorage(isLocal)
	const new_obj = {}
	new_obj[new_key] = new_value
	new_obj[`${new_key}_case_sensitive`] = caseSensitive

	const finish = () => {
		if (oldKey !== new_key) {
			renameProtectedReplacement(oldKey, new_key, wasProtected, loadSaved)
		} else {
			loadSaved()
		}
	}

	if (oldKey !== new_key) {
		storage.remove([oldKey, `${oldKey}_case_sensitive`], () => {
			storage.set(new_obj, finish)
		})
	} else {
		storage.set(new_obj, finish)
	}
}

const deleteReplacement = (key, isLocal) => {
	const protected_storage_key = {}
	protected_storage_key[PROTECTED_REPLACEMENTS_KEY] = []
	chrome.storage.sync.get(protected_storage_key, obj => {
		const protected_items = obj[PROTECTED_REPLACEMENTS_KEY] || []
		if (protected_items.indexOf(key) !== -1) { return; }

		getReplacementStorage(isLocal).remove([key, `${key}_case_sensitive`], loadSaved)
	})
}

const toggleProtectedReplacement = key => {
	const protected_storage_key = {}
	protected_storage_key[PROTECTED_REPLACEMENTS_KEY] = []
	chrome.storage.sync.get(protected_storage_key, obj => {
		const protected_items = obj[PROTECTED_REPLACEMENTS_KEY]
		const is_protected = protected_items.indexOf(key) !== -1
		const new_protected_items = is_protected ? protected_items.filter(item => item !== key) : [...protected_items, key]
		const new_obj = {}
		new_obj[PROTECTED_REPLACEMENTS_KEY] = new_protected_items
		chrome.storage.sync.set(new_obj, loadSaved)
	})
}

const renameProtectedReplacement = (oldKey, newKey, wasProtected, callback) => {
	if (!wasProtected) {
		callback()
		return
	}

	const protected_storage_key = {}
	protected_storage_key[PROTECTED_REPLACEMENTS_KEY] = []
	chrome.storage.sync.get(protected_storage_key, obj => {
		const protected_items = obj[PROTECTED_REPLACEMENTS_KEY]
		const new_protected_items = protected_items.filter(item => item !== oldKey)
		if (new_protected_items.indexOf(newKey) === -1) {
			new_protected_items.push(newKey)
		}

		const new_obj = {}
		new_obj[PROTECTED_REPLACEMENTS_KEY] = new_protected_items
		chrome.storage.sync.set(new_obj, callback)
	})
}

const deleteAllSaved = () => {
	const protected_storage_key = {}
	protected_storage_key[PROTECTED_REPLACEMENTS_KEY] = []
	chrome.storage.sync.get(protected_storage_key, protected_obj => {
		const protected_items = protected_obj[PROTECTED_REPLACEMENTS_KEY]
		chrome.storage.sync.get(null, sync_items => {
			chrome.storage.local.get(null, local_items => {
				const sync_keys = keysToDelete(sync_items, protected_items)
				const local_keys = keysToDelete(local_items, protected_items)

				chrome.storage.sync.remove(sync_keys, () => {
					chrome.storage.local.remove(local_keys, loadSaved)
				})
			})
		})
	})
}

const keysToDelete = (items, protectedItems) => {
	const keys = []
	for (var key in items) {
		if (isReplacementKey(key) && protectedItems.indexOf(key) === -1) {
			keys.push(key)
			keys.push(`${key}_case_sensitive`)
		}
	}
	return keys
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
		const is_enabled = obj[MUTATION_OBSERVER_KEY] !== false;
		toggleMutationObserverLabel(is_enabled)
	})
}

const setEnableCopyKeys = () => {
	withActiveSupportedTab(tab => {
		const hostname = new URL(tab.url).hostname
		document.getElementById('copy-url').textContent = hostname || '—'

		const storage_key = {}
		storage_key[ENABLE_COPY_HOSTS_KEY] = []
		chrome.storage.sync.get(storage_key, obj => {
			const hostnames = obj[ENABLE_COPY_HOSTS_KEY]
			toggleEnableCopyDomainLabel(hostnames.indexOf(hostname) !== -1)
		})
	})
}

const setPauseDomainKey = () => {
	withActiveSupportedTab(tab => {
		const hostname = new URL(tab.url).hostname
		document.getElementById('this-url').textContent = hostname || '—'

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

const toggleEnableCopyDomainLabel = (isEnabled) => {
	document.getElementById('enable-copy-domain').checked = isEnabled;
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

		reloadActiveTab()
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

		withActiveSupportedTab(tab => chrome.tabs.sendMessage(tab.id, { type: 'observe-changes' }, () => { void chrome.runtime.lastError; }))
	})
}

const toggleEnableCopyDomain = () => {
	withActiveSupportedTab(tab => {
		const hostname = new URL(tab.url).hostname

		const storage_key = {}
		storage_key[ENABLE_COPY_HOSTS_KEY] = []
		storage_key[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] = []
		chrome.storage.sync.get(storage_key, obj => {
			const hostnames = obj[ENABLE_COPY_HOSTS_KEY]
			const pending_flash_hostnames = obj[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY]
			const was_enabled = hostnames.indexOf(hostname) !== -1
			var new_hostnames;
			var new_pending_flash_hostnames;

			if (was_enabled) {
				new_hostnames = hostnames.filter(h => h !== hostname)
				new_pending_flash_hostnames = pending_flash_hostnames.filter(h => h !== hostname)
			} else {
				new_hostnames = hostnames
				if (new_hostnames.indexOf(hostname) === -1) {
					new_hostnames.push(hostname)
				}
				new_pending_flash_hostnames = pending_flash_hostnames
				if (new_pending_flash_hostnames.indexOf(hostname) === -1) {
					new_pending_flash_hostnames.push(hostname)
				}
			}

			const new_obj = {}
			new_obj[ENABLE_COPY_HOSTS_KEY] = new_hostnames
			new_obj[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] = new_pending_flash_hostnames
			chrome.storage.sync.set(new_obj, () => {
				if (was_enabled) {
					executeDisableCopy(tab.id, () => chrome.tabs.reload(tab.id))
				} else {
					reloadActiveTab()
				}
			})
		})
	})
}

const executeDisableCopy = (tabId, callback) => {
	chrome.scripting.executeScript({
		target: { tabId: tabId },
		files: ['enable-copy/flash-off.js']
	}, () => chrome.runtime.lastError)

	setTimeout(() => {
		callback()
	}, 1600)
}

const setStvDecodeKey = () => {
	chrome.storage.sync.get('stv-decode-enabled-interactive-fics', obj => {
		document.getElementById('stv-decode').checked = (obj['stv-decode-enabled-interactive-fics'] !== false)
	})
}

const toggleStvDecode = () => {
	chrome.storage.sync.set({ 'stv-decode-enabled-interactive-fics': document.getElementById('stv-decode').checked }, () => reloadActiveTab())
}

const togglePauseDomain = () => {
	withActiveSupportedTab(tab => {
		const hostname = new URL(tab.url).hostname

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

			withActiveSupportedTab(tab => chrome.tabs.sendMessage(tab.id, {}, () => { void chrome.runtime.lastError; }))
			window.close()
		})
	})
}

const isSupportedTabUrl = url => /^https?:\/\//.test(url || '')

const withActiveSupportedTab = callback => {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		const tab = tabs && tabs[0]
		if (tab && typeof tab.id === 'number' && isSupportedTabUrl(tab.url)) {
			callback(tab)
		}
	})
}

const reloadActiveTab = () => {
	withActiveSupportedTab(tab => chrome.tabs.reload(tab.id))
}

const exportReplacements = () => {
	chrome.storage.sync.get(null, items => {
		const out = {}
		for (const key in items) {
			if (isReplacementKey(key)) out[key] = items[key]
		}
		const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'interactivefics-substituicoes.json'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	})
}

const importReplacements = event => {
	const file = event.target.files && event.target.files[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = () => {
		try {
			const obj = JSON.parse(reader.result)
			if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Formato inválido')
			const safe = {}
			for (const [key, value] of Object.entries(obj)) {
				if (typeof key !== 'string' || key.length > 500) continue
				if (key.endsWith('_case_sensitive')) {
					if (typeof value === 'boolean') safe[key] = value
					continue
				}
				if (isReplacementKey(key) && typeof value === 'string' && value.length <= 2000) safe[key] = value
			}
			if (!Object.keys(safe).length) throw new Error('Nenhuma substituição válida')
			chrome.storage.sync.set(safe, () => {
				loadSaved()
				reloadActiveTab()
			})
		} catch (e) {
			alert((I18N[currentLang] || I18N.pt).invalid_file)
		}
	}
	reader.readAsText(file)
	event.target.value = ''
}

const clearStvCache = () => {
	chrome.storage.local.get(null, items => {
		const toRemove = Object.keys(items).filter(k => k.startsWith('stv-map-'))
		if (toRemove.length) chrome.storage.local.remove(toRemove, () => {
			alert((I18N[currentLang] || I18N.pt).cache_cleared.replace('{count}', toRemove.length))
			withActiveSupportedTab(tab => chrome.tabs.reload(tab.id))
		})
		else alert((I18N[currentLang] || I18N.pt).empty_cache)
	})
}

const forceDecode = () => {
	withActiveSupportedTab(tab => {
		chrome.tabs.sendMessage(tab.id, { type: 'force-decode' }, () => {
			window.close()
		})
	})
}

const setReviewModeKey = () => {
	chrome.storage.sync.get('review-mode-interactive-fics-yalla-bina', obj => {
		document.getElementById('review-mode').checked = (obj['review-mode-interactive-fics-yalla-bina'] === true)
	})
}

const toggleReviewMode = () => {
	chrome.storage.sync.set({ 'review-mode-interactive-fics-yalla-bina': document.getElementById('review-mode').checked }, () => {
		withActiveSupportedTab(tab => chrome.tabs.sendMessage(tab.id, {}, () => { void chrome.runtime.lastError; }))
	})
}


